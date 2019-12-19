/**
 * Copyright 2018 Google Inc. All rights reserved.
 * Modifications copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports.describe = function({testRunner, expect, product, FFOX, CHROME, WEBKIT}) {
  const {describe, xdescribe, fdescribe} = testRunner;
  const {it, fit, xit} = testRunner;
  const {beforeAll, beforeEach, afterAll, afterEach} = testRunner;

  describe('Page.$eval', function() {
    it('should work with css selector', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('css=section', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with id selector', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('id=testAttribute', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with data-test selector', async({page, server}) => {
      await page.setContent('<section data-test=foo id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('data-test=foo', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with data-testid selector', async({page, server}) => {
      await page.setContent('<section data-testid=foo id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('data-testid=foo', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with data-test-id selector', async({page, server}) => {
      await page.setContent('<section data-test-id=foo id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('data-test-id=foo', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with zs selector', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('zs="43543"', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should work with xpath selector', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('xpath=/html/body/section', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should auto-detect css selector', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      const idAttribute = await page.$eval('section', e => e.id);
      expect(idAttribute).toBe('testAttribute');
    });
    it('should accept arguments', async({page, server}) => {
      await page.setContent('<section>hello</section>');
      const text = await page.$eval('section', (e, suffix) => e.textContent + suffix, ' world!');
      expect(text).toBe('hello world!');
    });
    it('should accept ElementHandles as arguments', async({page, server}) => {
      await page.setContent('<section>hello</section><div> world</div>');
      const divHandle = await page.$('div');
      const text = await page.$eval('section', (e, div) => e.textContent + div.textContent, divHandle);
      expect(text).toBe('hello world');
    });
    it('should throw error if no element is found', async({page, server}) => {
      let error = null;
      await page.$eval('section', e => e.id).catch(e => error = e);
      expect(error.message).toContain('failed to find element matching selector "section"');
    });
    it('should support >> syntax', async({page, server}) => {
      await page.setContent('<section><div>hello</div></section>');
      const text = await page.$eval('css=section >> css=div', (e, suffix) => e.textContent + suffix, ' world!');
      expect(text).toBe('hello world!');
    });
    it('should support >> syntax with different engines', async({page, server}) => {
      await page.setContent('<section><div><span>hello</span></div></section>');
      const text = await page.$eval('xpath=/html/body/section >> css=div >> zs="hello"', (e, suffix) => e.textContent + suffix, ' world!');
      expect(text).toBe('hello world!');
    });
    it('should support spaces with >> syntax', async({page, server}) => {
      await page.goto(server.PREFIX + '/deep-shadow.html');
      const text = await page.$eval(' css = div >>css=div>>css   = span  ', e => e.textContent);
      expect(text).toBe('Hello from root2');
    });
    it('should enter shadow roots with >> syntax', async({page, server}) => {
      await page.goto(server.PREFIX + '/deep-shadow.html');
      const text1 = await page.$eval('css=div >> css=span', e => e.textContent);
      expect(text1).toBe('Hello from root1');
      const text2 = await page.$eval('css=div >> css=*:nth-child(2) >> css=span', e => e.textContent);
      expect(text2).toBe('Hello from root2');
      const nonExisting = await page.$('css=div div >> css=span');
      expect(nonExisting).not.toBeTruthy();
      const text3 = await page.$eval('css=section div >> css=span', e => e.textContent);
      expect(text3).toBe('Hello from root1');
      const text4 = await page.$eval('xpath=/html/body/section/div >> css=div >> css=span', e => e.textContent);
      expect(text4).toBe('Hello from root2');
      const text5 = await page.$eval('zs=section div >> css=div >> css=span', e => e.textContent);
      expect(text5).toBe('Hello from root2');
    });
  });

  describe('Page.$$eval', function() {
    it('should work with css selector', async({page, server}) => {
      await page.setContent('<div>hello</div><div>beautiful</div><div>world!</div>');
      const divsCount = await page.$$eval('css=div', divs => divs.length);
      expect(divsCount).toBe(3);
    });
    it('should work with zs selector', async({page, server}) => {
      await page.setContent('<div>hello</div><div>beautiful</div><div>world!</div>');
      const divsCount = await page.$$eval('zs=div', divs => divs.length);
      expect(divsCount).toBe(3);
    });
    it('should work with xpath selector', async({page, server}) => {
      await page.setContent('<div>hello</div><div>beautiful</div><div>world!</div>');
      const divsCount = await page.$$eval('xpath=/html/body/div', divs => divs.length);
      expect(divsCount).toBe(3);
    });
    it('should auto-detect css selector', async({page, server}) => {
      await page.setContent('<div>hello</div><div>beautiful</div><div>world!</div>');
      const divsCount = await page.$$eval('div', divs => divs.length);
      expect(divsCount).toBe(3);
    });
    it('should support >> syntax', async({page, server}) => {
      await page.setContent('<div><span>hello</span></div><div>beautiful</div><div><span>wo</span><span>rld!</span></div><span>Not this one</span>');
      const spansCount = await page.$$eval('css=div >> css=span', spans => spans.length);
      expect(spansCount).toBe(3);
    });
    it('should enter shadow roots with >> syntax', async({page, server}) => {
      await page.goto(server.PREFIX + '/deep-shadow.html');
      const spansCount = await page.$$eval('css=div >> css=div >> css=span', spans => spans.length);
      expect(spansCount).toBe(2);
    });
  });

  describe('Page.$', function() {
    it('should query existing element with css selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('css=section');
      expect(element).toBeTruthy();
    });
    it('should query existing element with zs selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('zs="test"');
      expect(element).toBeTruthy();
    });
    it('should query existing element with xpath selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('xpath=/html/body/section');
      expect(element).toBeTruthy();
    });
    it('should return null for non-existing element', async({page, server}) => {
      const element = await page.$('non-existing-element');
      expect(element).toBe(null);
    });
    it('should auto-detect xpath selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('//html/body/section');
      expect(element).toBeTruthy();
    });
    it('should auto-detect zs selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('"test"');
      expect(element).toBeTruthy();
    });
    it('should auto-detect css selector', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const element = await page.$('section');
      expect(element).toBeTruthy();
    });
    it('should support >> syntax', async({page, server}) => {
      await page.setContent('<section><div>test</div></section>');
      const element = await page.$('css=section >> css=div');
      expect(element).toBeTruthy();
    });
    it('should respect waitFor visibility', async({page, server}) => {
      await page.setContent('<section id="testAttribute">43543</section>');
      expect(await page.waitForSelector('css=section', { waitFor: 'visible'})).toBeTruthy();
      expect(await page.waitForSelector('css=section', { waitFor: 'any'})).toBeTruthy();
      expect(await page.waitForSelector('css=section')).toBeTruthy();

      await page.setContent('<section id="testAttribute" style="display: none">43543</section>');
      expect(await page.waitForSelector('css=section', { waitFor: 'hidden'})).toBeTruthy();
      expect(await page.waitForSelector('css=section', { waitFor: 'any'})).toBeTruthy();
      expect(await page.waitForSelector('css=section')).toBeTruthy();
    });
  });

  describe('Page.$$', function() {
    it('should query existing elements', async({page, server}) => {
      await page.setContent('<div>A</div><br/><div>B</div>');
      const elements = await page.$$('div');
      expect(elements.length).toBe(2);
      const promises = elements.map(element => page.evaluate(e => e.textContent, element));
      expect(await Promise.all(promises)).toEqual(['A', 'B']);
    });
    it('should return empty array if nothing is found', async({page, server}) => {
      await page.goto(server.EMPTY_PAGE);
      const elements = await page.$$('div');
      expect(elements.length).toBe(0);
    });
  });

  describe('Path.$x', function() {
    it('should query existing element', async({page, server}) => {
      await page.setContent('<section>test</section>');
      const elements = await page.$x('/html/body/section');
      expect(elements[0]).toBeTruthy();
      expect(elements.length).toBe(1);
    });
    it('should return empty array for non-existing element', async({page, server}) => {
      const element = await page.$x('/html/body/non-existing-element');
      expect(element).toEqual([]);
    });
    it('should return multiple elements', async({page, sever}) => {
      await page.setContent('<div></div><div></div>');
      const elements = await page.$x('/html/body/div');
      expect(elements.length).toBe(2);
    });
  });


  describe('ElementHandle.$', function() {
    it('should query existing element', async({page, server}) => {
      await page.goto(server.PREFIX + '/playground.html');
      await page.setContent('<html><body><div class="second"><div class="inner">A</div></div></body></html>');
      const html = await page.$('html');
      const second = await html.$('.second');
      const inner = await second.$('.inner');
      const content = await page.evaluate(e => e.textContent, inner);
      expect(content).toBe('A');
    });

    it('should query existing element with zs selector', async({page, server}) => {
      await page.goto(server.PREFIX + '/playground.html');
      await page.setContent('<html><body><div class="second"><div class="inner">A</div></div></body></html>');
      const html = await page.$('zs=html');
      const second = await html.$('zs=.second');
      const inner = await second.$('zs=.inner');
      const content = await page.evaluate(e => e.textContent, inner);
      expect(content).toBe('A');
    });

    it('should return null for non-existing element', async({page, server}) => {
      await page.setContent('<html><body><div class="second"><div class="inner">B</div></div></body></html>');
      const html = await page.$('html');
      const second = await html.$('.third');
      expect(second).toBe(null);
    });
  });
  describe('ElementHandle.$eval', function() {
    it('should work', async({page, server}) => {
      await page.setContent('<html><body><div class="tweet"><div class="like">100</div><div class="retweets">10</div></div></body></html>');
      const tweet = await page.$('.tweet');
      const content = await tweet.$eval('.like', node => node.innerText);
      expect(content).toBe('100');
    });

    it('should retrieve content from subtree', async({page, server}) => {
      const htmlContent = '<div class="a">not-a-child-div</div><div id="myId"><div class="a">a-child-div</div></div>';
      await page.setContent(htmlContent);
      const elementHandle = await page.$('#myId');
      const content = await elementHandle.$eval('.a', node => node.innerText);
      expect(content).toBe('a-child-div');
    });

    it('should throw in case of missing selector', async({page, server}) => {
      const htmlContent = '<div class="a">not-a-child-div</div><div id="myId"></div>';
      await page.setContent(htmlContent);
      const elementHandle = await page.$('#myId');
      const errorMessage = await elementHandle.$eval('.a', node => node.innerText).catch(error => error.message);
      expect(errorMessage).toBe(`Error: failed to find element matching selector ".a"`);
    });
  });
  describe('ElementHandle.$$eval', function() {
    it('should work', async({page, server}) => {
      await page.setContent('<html><body><div class="tweet"><div class="like">100</div><div class="like">10</div></div></body></html>');
      const tweet = await page.$('.tweet');
      const content = await tweet.$$eval('.like', nodes => nodes.map(n => n.innerText));
      expect(content).toEqual(['100', '10']);
    });

    it('should retrieve content from subtree', async({page, server}) => {
      const htmlContent = '<div class="a">not-a-child-div</div><div id="myId"><div class="a">a1-child-div</div><div class="a">a2-child-div</div></div>';
      await page.setContent(htmlContent);
      const elementHandle = await page.$('#myId');
      const content = await elementHandle.$$eval('.a', nodes => nodes.map(n => n.innerText));
      expect(content).toEqual(['a1-child-div', 'a2-child-div']);
    });

    it('should not throw in case of missing selector', async({page, server}) => {
      const htmlContent = '<div class="a">not-a-child-div</div><div id="myId"></div>';
      await page.setContent(htmlContent);
      const elementHandle = await page.$('#myId');
      const nodesLength = await elementHandle.$$eval('.a', nodes => nodes.length);
      expect(nodesLength).toBe(0);
    });

  });

  describe('ElementHandle.$$', function() {
    it('should query existing elements', async({page, server}) => {
      await page.setContent('<html><body><div>A</div><br/><div>B</div></body></html>');
      const html = await page.$('html');
      const elements = await html.$$('div');
      expect(elements.length).toBe(2);
      const promises = elements.map(element => page.evaluate(e => e.textContent, element));
      expect(await Promise.all(promises)).toEqual(['A', 'B']);
    });

    it('should return empty array for non-existing elements', async({page, server}) => {
      await page.setContent('<html><body><span>A</span><br/><span>B</span></body></html>');
      const html = await page.$('html');
      const elements = await html.$$('div');
      expect(elements.length).toBe(0);
    });
  });


  describe('ElementHandle.$x', function() {
    it('should query existing element', async({page, server}) => {
      await page.goto(server.PREFIX + '/playground.html');
      await page.setContent('<html><body><div class="second"><div class="inner">A</div></div></body></html>');
      const html = await page.$('html');
      const second = await html.$x(`./body/div[contains(@class, 'second')]`);
      const inner = await second[0].$x(`./div[contains(@class, 'inner')]`);
      const content = await page.evaluate(e => e.textContent, inner[0]);
      expect(content).toBe('A');
    });

    it('should return null for non-existing element', async({page, server}) => {
      await page.setContent('<html><body><div class="second"><div class="inner">B</div></div></body></html>');
      const html = await page.$('html');
      const second = await html.$x(`/div[contains(@class, 'third')]`);
      expect(second).toEqual([]);
    });
  });

  describe('zselector', () => {
    it('query', async ({page}) => {
      await page.setContent(`<div>yo</div><div>ya</div><div>ye</div>`);
      expect(await page.$eval(`zs="ya"`, e => e.outerHTML)).toBe('<div>ya</div>');

      await page.setContent(`<div foo="baz"></div><div foo="bar space"></div>`);
      expect(await page.$eval(`zs=[foo="bar space"]`, e => e.outerHTML)).toBe('<div foo="bar space"></div>');

      await page.setContent(`<div>yo<span></span></div>`);
      expect(await page.$eval(`zs=span`, e => e.outerHTML)).toBe('<span></span>');
      expect(await page.$eval(`zs=div > span`, e => e.outerHTML)).toBe('<span></span>');
      expect(await page.$eval(`zs=div span`, e => e.outerHTML)).toBe('<span></span>');
      expect(await page.$eval(`zs="yo" > span`, e => e.outerHTML)).toBe('<span></span>');
      expect(await page.$eval(`zs="yo" span`, e => e.outerHTML)).toBe('<span></span>');
      expect(await page.$eval(`zs=span ^`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs=span ~ div`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs=span ~ "yo"`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');

      await page.setContent(`<div>yo</div><div>yo<span></span></div>`);
      expect(await page.$eval(`zs="yo"#0`, e => e.outerHTML)).toBe('<div>yo</div>');
      expect(await page.$eval(`zs="yo"#1`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs="yo" ~ DIV#1`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs=span ~ div#1`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs=span ~ div#0`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');
      expect(await page.$eval(`zs=span ~ "yo"#1 ^ > div`, e => e.outerHTML)).toBe('<div>yo</div>');
      expect(await page.$eval(`zs=span ~ "yo"#1 ^ > div#1`, e => e.outerHTML)).toBe('<div>yo<span></span></div>');

      await page.setContent(`<div>yo<span id="s1"></span></div><div>yo<span id="s2"></span><span id="s3"></span></div>`);
      expect(await page.$eval(`zs="yo"`, e => e.outerHTML)).toBe('<div>yo<span id="s1"></span></div>');
      expect(await page.$$eval(`zs="yo"`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<div>yo<span id="s1"></span></div>\n<div>yo<span id="s2"></span><span id="s3"></span></div>');
      expect(await page.$$eval(`zs="yo"#1`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<div>yo<span id="s2"></span><span id="s3"></span></div>');
      expect(await page.$$eval(`zs="yo" ~ span`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<span id="s1"></span>\n<span id="s2"></span>\n<span id="s3"></span>');
      expect(await page.$$eval(`zs="yo"#1 ~ span`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<span id="s2"></span>\n<span id="s3"></span>');
      expect(await page.$$eval(`zs="yo" ~ span#0`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<span id="s1"></span>\n<span id="s2"></span>');
      expect(await page.$$eval(`zs="yo" ~ span#1`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<span id="s2"></span>\n<span id="s3"></span>');
    });

    it('create', async ({page}) => {
      await page.setContent(`<div>yo</div><div>ya</div><div>ya</div>`);
      expect(await page._createSelector('zs', await page.$('div'))).toBe('"yo"');
      expect(await page._createSelector('zs', await page.$('div:nth-child(2)'))).toBe('"ya"');
      expect(await page._createSelector('zs', await page.$('div:nth-child(3)'))).toBe('"ya"#1');

      await page.setContent(`<img alt="foo bar">`);
      expect(await page._createSelector('zs', await page.$('img'))).toBe('img[alt="foo bar"]');

      await page.setContent(`<div>yo<span></span></div><span></span>`);
      expect(await page._createSelector('zs', await page.$('span'))).toBe('"yo"~SPAN');
      expect(await page._createSelector('zs', await page.$('span:nth-child(2)'))).toBe('SPAN#1');
    });

    it('children of various display parents', async ({page}) => {
      await page.setContent(`<body><div style='position: fixed;'><span>yo</span></div></body>`);
      expect(await page._createSelector('zs', await page.$('span'))).toBe('"yo"');

      await page.setContent(`<div style='position: relative;'><span>yo</span></div>`);
      expect(await page._createSelector('zs', await page.$('span'))).toBe('"yo"');

      // "display: none" makes all children text invisible - fallback to tag name.
      await page.setContent(`<div style='display: none;'><span>yo</span></div>`);
      expect(await page._createSelector('zs', await page.$('span'))).toBe('SPAN');
    });

    it('boundary', async ({page}) => {
      await page.setContent(`
        <div>hey</div>
        <div>hey</div>
        <div>hey</div>
        <div>
          <div>yo</div>
          <div>hello</div>
          <div>hello</div>
          <div>hello</div>
          <div>unique</div>
          <div>
            <div>hey2<span></span><span></span><span></span></div>
            <div>hello</div>
          </div>
          <div>
            <div>hey<span></span><span></span><span></span></div>
            <div>hello</div>
          </div>
        </div>
        <div>
          <div>ya<div>
          <div id=first>hello</div>
          <div>hello</div>
          <div>hello</div>
          <div>
            <div>hey2<span></span><span></span><span></span></div>
            <div>hello</div>
          </div>
          <div>
            <div>hey<span></span><span></span><span></span></div>
            <div id=target>hello</div>
          </div>
        </div>
        <div>
          <div>ya<div>
          <div id=first2>hello</div>
          <div>hello</div>
          <div>hello</div>
          <div>
            <div>hey2<span></span><span></span><span></span></div>
            <div>hello</div>
          </div>
          <div>
            <div>hey<span></span><span></span><span></span></div>
            <div id=target2>hello</div>
          </div>
        </div>`);
      expect(await page._createSelector('zs', await page.$('#target'))).toBe('"ya"~"hey"~"hello"');
      expect(await page.$eval(`zs="ya"~"hey"~"hello"`, e => e.outerHTML)).toBe('<div id="target">hello</div>');
      expect(await page.$eval(`zs="ya"~"hey"~"unique"`, e => e.outerHTML).catch(e => e.message)).toBe('Error: failed to find element matching selector "zs="ya"~"hey"~"unique""');
      expect(await page.$$eval(`zs="ya" ~ "hey" ~ "hello"`, es => es.map(e => e.outerHTML).join('\n'))).toBe('<div id="target">hello</div>\n<div id="target2">hello</div>');
    });
  });
};
