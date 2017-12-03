'use strict';

const _ = require('lodash');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const Mock = require('../index').Mock;
const expect = require('chai').expect;

const EventEmitter = require('events').EventEmitter;

function subdirectoriesFs(p, cb) {
  let dirs = [];
  function checkStats(files, idx) {
    if(idx >= files.length) {
      return cb(null, dirs);
    } else {
      fs.stat(path.join(p, files[idx]), (err, stats) => {
        if(!err && stats.isDirectory()) {
          dirs.push(files[idx]);
        }
        checkStats(files, ++idx);
      });
    }
  }
  fs.readdir(p, (err, files) => {
    if(err) {
      return cb(err);
    }
    checkStats(files, 0);
  });
}

function subdirectoriesCp(p, cb) {
  let dirs = [];
  let data = ''
  let proc = child_process.spawn('ls', ['-lA', p]);
  proc.stdout.on('data', chunk => {
    data += chunk;
  });
  proc.on('close', code => {
    if(code !== 0) {
      return cb(new Error(code));
    }
    const dirRe = /^d[\s\S]+\s(.*)$/;
    const output = data.split('\n');
    for(let i = 0; i < output.length; ++i) {
      const match = dirRe.exec(output[i]);
      if(match) {
        dirs.push(match[1]);
      }
    }
    cb(null, dirs);
  })
}

describe('Examples', () => {

  describe('subdirectoriesFs', () => {
    let fsMock = null;

    before(() => {
      fsMock = new Mock(fs);
    });

    after(() => {
      if(fsMock) {
        fsMock.cleanup();
      }
    });

    it('Should return error if readdir fails', (done) => {
      fsMock.expectCall('readdir')
        .willOnce((p, cb) => cb(new Error('TESTERROR')));

        subdirectoriesFs('/some/wrong/path', (err, dirs) => {
        expect(err).to.be.instanceOf(Error);
        fsMock.verify(done);
      });
    });

    it('Should find all items that are directories', (done) => {    
      fsMock.expectCall('readdir')
        .matching((p, cb) => p === '.')
        .willOnce((p, cb) => cb(null, ['a', 'b', 'c', 'd', 'e', 'f']));
  
      fsMock.expectCall('stat')
        .times(6)
        .willOnce((p, cb) => cb(null, {isDirectory: () => true}))
        .willOnce((p, cb) => cb(null, {isDirectory: () => false}))
        .willOnce((p, cb) => cb(null, {isDirectory: () => true}))
        .willRepeatedly((p, cb) => cb(null, {isDirectory: () => false}))
  
        subdirectoriesFs('.', (err, dirs) => {
        expect(err).to.be.null;
        expect(dirs).to.deep.equal(['a', 'c']);
        fsMock.verify(done);
      });
    });

    it('Should skip item if stats fail', (done) => {
      fsMock.expectCall('readdir')
        .willOnce((p, cb) => cb(null, ['a', 'b', 'c', 'd', 'e', 'f']));

      fsMock.expectCall('stat')
        .times(6)
        .willOnce((p, cb) => cb(null, {isDirectory: () => true}))
        .willOnce((p, cb) => cb(new Error('TESTERROR')))
        .willOnce((p, cb) => cb(null, {isDirectory: () => false}))
        .willRepeatedly((p, cb) => cb(null, {isDirectory: () => true}))

        subdirectoriesFs('/some/wrong/path', (err, dirs) => {
        expect(err).to.be.null;
        expect(dirs).to.deep.equal(['a', 'd', 'e', 'f']);
        fsMock.verify(done);
      });
    });
  });

  describe('subdirectoriesCp', () => {
    let cpMock = null;

    before(() => {
      cpMock = new Mock(child_process);
    });

    after(() => {
      if(cpMock) {
        cpMock.cleanup();
      }
    });

    it('Should return all output lines that match directory pattern', (done) => {
      let proc = new EventEmitter();
      proc.stdout = new EventEmitter();
      cpMock.expectCall('spawn')
        .matching((cmd, args) => cmd === 'ls')
        .willOnce(proc);

      subdirectoriesCp('.', (err, dirs) => {
        expect(dirs).to.deep.equal(['dir1', 'dir2']);
        cpMock.verify(done);
      });

      proc.stdout.emit('data', 'drwxrwxrwx ... dir1\n'); 
      proc.stdout.emit('data', '-rw-r--r-- ... file1\n');
      proc.stdout.emit('data', '-rw-r--r-- ... file1\n');
      proc.stdout.emit('data', 'drw-r--r-- ... dir2');
      proc.emit('close', 0);
    });
  });
});