import { assert } from 'chai'
import { assertUserIsLoggedIn, assertUserIsNotLoggedIn, createUserAndLogin, createPlaylist, createVideo } from './helpers.js'

const playerIsFullScreen = () => !!(
  document.fullscreenElement ||
  document.mozFullScreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement
)

describe('Player:', function () {
  before(function () {
    browser.addCommand('waitUntilVideoIsPlaying', () => {
      browser.waitUntil(() => (
        parseInt(browser.getAttribute('#video-player', 'currentTime'), 10) !== 0 &&
        browser.getAttribute('#video-player', 'paused') !== 'true' &&
        browser.getAttribute('#video-player', 'ended') !== 'true'
      ))
    })
  })

  beforeEach(function () {
    server.execute(createVideo, '12345', 'Test 1', '', '', [''], 0)
    server.execute(createVideo, '23456', 'Test 2', '', '', [''], 0)
    server.execute(createPlaylist, '98765', 'Playlist test', ['12345', '23456'])
  })

  it('play a free video', function () {
    browser.url('http://localhost:3000/play/12345')
    browser.waitForExist('#video-player')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    browser.waitForExist('.player-controls')
    assert.isTrue(browser.getAttribute('.player-container', 'class').includes('play'))
    browser.waitAndClick('#play-pause-button')
    assert.isTrue(browser.getAttribute('#nav', 'class').includes('closed'))
    assert.isTrue(browser.getAttribute('.player-container', 'class').includes('pause'))
    assert.isTrue(browser.getAttribute('.player-container', 'class').includes('pause'))
  })

  it('click on the progress bar [TODO]', function () {
    browser.url('http://localhost:3000/play/12345')
    browser.waitForExist('#video-player')
    // browser.waitForExist('#loaded-bar')
    // browser.waitUntil(() => browser.getElementSize('#loaded-bar', 'width') > 30, 5000, 'video load timeout')
    // browser.click('#loaded-bar')
    // browser.pause(2000)
    // assert.notEqual(browser.getText('#current-time'), '00:00')
    // assert.isAbove(browser.getElementSize('#played-bar', 'width'), 0)
    // assert.isAbove(browser.getLocation('#scrubber', 'x'), 0)
  })

  it('click on next video', () => {
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    // Close modal
    // browser.waitForExist('#loginModal')
    // browser.click('#btn-editprofile-close')
    // browser.pause(2000)
    browser.waitAndClick('#next-video-button')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 2')
  })

  it('click on previous video', () => {
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    browser.waitAndClick('#previous-video-button')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 2')
  })

  it('if a player is within a playlist and it ended related videos don\'t show up [TODO]', () => {
  })

  it('if a player is not within a playlist and it ended related videos show up [TODO]', () => {
  })

  it('like and dislike a video as an anonymous user', () => {
    assertUserIsNotLoggedIn(browser)
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForClickable('#button-like')
    assert.equal(browser.getText('#button-like'), '0')
    assert.equal(browser.getText('#button-dislike'), '0')

    browser.click('#button-like')
    browser.waitUntil(() => {
      return browser.getText('#button-like') === '1'
    })
    assert.equal(browser.getText('#button-like'), '1')
    assert.equal(browser.getText('#button-dislike'), '0')

    browser.click('#button-dislike')

    browser.waitUntil(() => {
      return browser.getText('#button-like') === '0'
    })

    assert.equal(browser.getText('#button-like'), '0')
    assert.equal(browser.getText('#button-dislike'), '1')
  })
  it('like and dislike a video as a logged-in user', () => {
    createUserAndLogin(browser)
    assertUserIsLoggedIn(browser)
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForClickable('#button-like')
    assert.equal(browser.getText('#button-like'), '0')
    assert.equal(browser.getText('#button-dislike'), '0')

    browser.click('#button-like')
    browser.waitUntil(() => {
      return browser.getText('#button-like') === '1'
    })
    assert.equal(browser.getText('#button-like'), '1')
    assert.equal(browser.getText('#button-dislike'), '0')

    browser.click('#button-dislike')
    browser.waitUntil(() => {
      return browser.getText('#button-like') === '0'
    })
    assert.equal(browser.getText('#button-like'), '0')
    assert.equal(browser.getText('#button-dislike'), '1')
  })

  it('should play/pause a video when the spacebar is pressed', () => {
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForClickable('#play-pause-button')
    browser.switchTab()
    browser.waitUntil(() => browser.hasFocus('#player-container'))
    browser.keys('Space')

    browser.waitUntilVideoIsPlaying()

    browser.keys('Space')

    browser.waitUntil(() => browser.getAttribute('#video-player', 'paused') === 'true')
  })

  it('should stay in full-screen mode when a video is paused via the space bar', () => {
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitAndClick('#play-pause-button')
    browser.waitUntilVideoIsPlaying()

    browser.waitAndClick('#fullscreen-button')

    assert.equal(browser.execute(playerIsFullScreen).value, true)

    browser.switchTab()
    browser.keys('Space')

    browser.waitUntil(() => browser.getAttribute('#video-player', 'paused') === 'true')

    assert.equal(browser.execute(playerIsFullScreen).value, true)

    browser.waitAndClick('#fullscreen-button')
  })
})
