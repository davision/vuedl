import Dialog from '../src/dialog'
import Vue from 'vue'
import FooBar from './fixtures/foobar'
import AsyncData from './fixtures/async-data'
import AsyncDataAwait from './fixtures/async-data-await'
import AsyncDataError from './fixtures/async-data-error'
import AsyncDataCb from './fixtures/async-data-callback'
import ManyTimesUsage from './fixtures/many-times-usage'
import { sleep } from './utils'
import Plugin from '../src'

describe('dialog', () => {
  beforeAll(() => {
    Vue.use(Plugin)
  })

  test('Check self asyncData and fetch', async () => {
    // const context = {store: 'ctx'}

    const fetchFn = jest.fn(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve('fetched'), 10)
      })
    })

    const asyncDataFn = jest.fn((context) => {
      return new Promise(resolve => {
        setTimeout(() => resolve({foo: 'asyncData', ...context}), 10)
      })
    })

    const component = {
      fetch: fetchFn,
      asyncData: asyncDataFn,
      ...FooBar
    }

    const dlg = new Dialog(component)
    await dlg.show()

    // dlg.wait().then(res => {
    //   console.log(res, 'res')
    // })
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(asyncDataFn).toHaveBeenCalledTimes(1)
    expect(dlg.vm.$data).toMatchObject({foo: 'asyncData'})
    dlg.close()
  })

  test('Check asyncData', async () => {
    const dlg = new Dialog(AsyncData)
    await dlg.show()
    expect(dlg.vm.$data).toHaveProperty('name', 'Async data')
    expect(dlg.element.innerHTML).toBe('Async data')
    dlg.close()
  })

  test('Check return', async () => {
    const dlg = new Dialog(AsyncData)
    await dlg.show()
    expect(dlg.vm.$data).toHaveProperty('name', 'Async data')
    expect(dlg.element.innerHTML).toBe('Async data')
    dlg.close()
  })

  test('Check asyncData await', async () => {
    const dlg = new Dialog(AsyncDataAwait)
    await dlg.show()
    expect(dlg.vm.$data).toHaveProperty('name', 'Await async data')
    expect(dlg.element.innerHTML).toBe('Await async data')
    dlg.close()
  })

  test('Check asyncData callback', async () => {
    const dlg = new Dialog(AsyncDataCb)
    await dlg.show()
    expect(dlg.vm.$data).toHaveProperty('name', 'Async data with callback')
    expect(dlg.element.innerHTML).toBe('Async data with callback')
    dlg.close()
  })

  test('Check asyncData error', async () => {
    const dlg = new Dialog(AsyncDataError)
    expect(dlg.show()).rejects.toThrowError('Error in asyncData')
    expect(dlg.element).toBe(null)
    expect(dlg.vm).toBe(null)
  })

  test('Check many times usage', async () => {
    const fnWait = jest.fn()

    const fn = ManyTimesUsage.asyncData = jest.fn(ManyTimesUsage.asyncData)
    const fnData = ManyTimesUsage.data = jest.fn(ManyTimesUsage.data)
    const dlg = new Dialog(ManyTimesUsage)
    await dlg.show()
    dlg.wait().then(fnWait)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fnData).toHaveBeenCalledTimes(1)
    expect(dlg.element.innerHTML).toBe('Foo Bar')
    dlg.close()
    await sleep(1)
    expect(fnWait).toHaveBeenCalledTimes(1)

    await dlg.show()
    dlg.wait().then(fnWait)
    dlg.wait().then(fnWait)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fnData).toHaveBeenCalledTimes(2)
    expect(dlg.element.innerHTML).toBe('Foo Bar')
    dlg.close()
    await sleep(1)
    expect(fnWait).toHaveBeenCalledTimes(3)

    await dlg.show()
    dlg.wait().then(fnWait)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fnData).toHaveBeenCalledTimes(3)
    expect(dlg.element.innerHTML).toBe('Foo Bar')
    dlg.close()
    await sleep(1)
    expect(fnWait).toHaveBeenCalledTimes(4)
  })

  test('Check props and is New', async () => {
    const dlg = new Dialog(AsyncData)
    await dlg.show({id: 123})
    expect(dlg.vm.$parameters).toHaveProperty('id', 123)
    expect(dlg.vm).toHaveProperty('isNewRecord', false)
    dlg.close()
  })
})