/**
 * tests/houston/model/cycle.js
 * Tests cycle model for function abilities
 */

import chai from 'chai'

import Cycle from '~/houston/model/cycle'
import db from '~/lib/database'

const assert = chai.assert

describe('cycle', () => {
  it('validates repo value', (done) => {
    Cycle.create({
      project: new db.Types.ObjectId(),
      auth: 'asdf',
      repo: 'git@github.com:elementary/vocal.git',
      tag: 'v1.0.0',
      name: 'com.github.vocalapp.vocal',
      version: '1.0.0',
      type: 'RELEASE',
      changelog: [['testing']]
    }, (err) => {
      if (err) done(err)

      Cycle.create({
        project: new db.Types.ObjectId(),
        auth: 'asdf',
        repo: 'lp:~elementary/vocal',
        tag: 'v1.0.0',
        name: 'com.github.vocalapp.vocal',
        version: '1.0.0',
        type: 'RELEASE',
        changelog: [['testing']]
      }, (err) => {
        assert.instanceOf(err, Error, 'throws an error')

        done()
      })
    })
  })

  it('validates version value', (done) => {
    Cycle.create({
      project: new db.Types.ObjectId(),
      auth: 'asdf',
      repo: 'git@github.com:elementary/vocal.git',
      tag: 'v1.0.0',
      name: 'com.github.vocalapp.vocal',
      version: '1.0.0',
      type: 'RELEASE',
      changelog: [['testing']]
    }, (err) => {
      if (err) done(err)

      Cycle.create({
        project: new db.Types.ObjectId(),
        auth: 'asdf',
        repo: 'git@github.com:elementary/vocal.git',
        tag: 'v1.0.0',
        name: 'com.github.vocalapp.vocal',
        version: 'v1.0.0.3',
        type: 'RELEASE',
        changelog: 'testing'
      }, (err) => {
        assert.instanceOf(err, Error, 'throws an error')

        done()
      })
    })
  })

  it('can get status of a no build cycle', async (done) => {
    Cycle.create({
      project: new db.Types.ObjectId(),
      auth: 'asdf',
      repo: 'git@github.com:elementary/vocal.git',
      tag: 'v1.0.0',
      name: 'com.github.vocalapp.vocal',
      version: '1.0.0',
      type: 'RELEASE',
      changelog: [['testing']]
    }, async (err, cycle) => {
      if (err) done(err)

      const status = await cycle.getStatus()
      assert.equal(status, 'QUEUE')

      done()
    })
  })

  it('can set status', async (done) => {
    Cycle.create({
      project: new db.Types.ObjectId(),
      auth: 'asdf',
      repo: 'git@github.com:elementary/vocal.git',
      tag: 'v1.0.0',
      name: 'com.github.vocalapp.vocal',
      version: '1.0.0',
      type: 'RELEASE',
      changelog: [['testing']],
      _status: 'QUEUE'
    }, async (err, cycle) => {
      if (err) done(err)

      const stat = await cycle.setStatus('RUN')
      assert.equal(stat.nModified, 1, 'updated status')

      done()
    })
  })

  it('can do flightcheck', async (done) => {
    Cycle.create({
      project: new db.Types.ObjectId(),
      auth: 'asdf',
      repo: 'git@github.com:elementary/vocal.git',
      tag: 'v1.0.0',
      name: 'com.github.vocalapp.vocal',
      version: '1.0.0',
      type: 'RELEASE',
      changelog: [['testing']],
      _status: 'QUEUE'
    }, async (err, cycle) => {
      if (err) done(err)

      cycle.doFlightcheck()
      .then(() => done())
      .catch((error) => done(error))
    })
  })
})
