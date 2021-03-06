/**
 * flightcheck/houston.js
 * Listens to requests from houston
 */

import assert from 'assert'

import * as atc from 'lib/atc'
import config from 'lib/config'
import Log from 'lib/log'
import Pipeline from './pipeline'

const log = new Log('flightcheck')

const worker = new atc.Worker('cycle')
const sender = new atc.Sender('cycle')

log.info(`Running in ${config.env} configuration`)

worker.on('error', (err) => {
  log.error('Flightcheck errored')
  log.error(err)
})

worker.register('release', async (param) => {
  assert(param.id, 'Flightcheck needs a database id to run Pipeline')
  assert(param.repo, 'Flightcheck needs a Git repository to run Pipeline')
  assert(param.tag, 'Flightcheck needs a Git tag to run Pipeline')

  let pipeline = null
  try {
    const changelog = param.changelog.map((c) => {
      c['changes'] = c['changelog']
      return c
    })

    pipeline = new Pipeline({
      repo: param.repo,
      tag: param.tag,
      name: param.name,
      source: 'github',
      changelog,
      auth: param.auth,
      stripe: param.stripe
    })
  } catch (err) {
    log.error(`Flightcheck received an error while trying to create Pipeline for ${param.id}`)
    log.error(err)

    sender.add('error', {
      id: param.id,
      error: err
    })
    return
  }

  log.debug(`Starting flightcheck on ${param.id}`)
  sender.add('start', {
    id: param.id
  })

  try {
    await pipeline.start()
  } catch (err) {
    if (err.pipe == null) {
      log.error(`Flightcheck received an error while running Pipeline for ${param.id}`)
      log.error(err)

      sender.add('error', {
        id: param.id,
        error: err
      })
      return
    }
  }

  log.info(`Flightcheck finished with Pipeline for ${param.id}`)

  const apphub = pipeline.pipes.find((p) => (p.name === 'AppHub'))
  const aptly = pipeline.pipes.find((p) => (p.name === 'ElementaryAptly'))
  const logs = await pipeline.logs()

  const payload = {
    id: param.id,
    apphub: (apphub != null) ? apphub.data : null,
    aptly: (aptly != null) ? aptly.data : null,
    logs
  }

  log.debug(`Sending finished Pipeline data for ${param.id}`)
  log.debug(payload)

  sender.add('finish', payload)
  return
})

worker.start()
