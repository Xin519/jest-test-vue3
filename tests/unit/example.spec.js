import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
// const ids = document.getElementById

// describe('HelloWorld.vue', () => {
//   it('renders props.msg when passed', () => {
//     const msg = 'new message'
//     const wrapper = shallowMount(HelloWorld, {
//       props: { msg }
//     })
//     expect(wrapper.text()).toMatch(msg)
//   })
// })

describe('App.vue', () => {
  let wrapper, input, liDom
  // 每个it开始之前执行
  beforeEach(() => {
    wrapper = shallowMount(App)
    input = wrapper.find('.new-todo')
    
  })

  test('input 回车事件有内容发布 addTodo 事件', async () => {
    // 有内容，发布 addTodo 事件 测试预期 向 li 添加数据 内容为 变量 text 数量只有1条
    const text = 'leaf'
    input.setValue(text)
    await input.trigger('keyup.enter')
    liDom = wrapper.find('.todo-list').findAll('li')
    expect(liDom[0].find('label').element.innerHTML).toBe(text)
    expect(liDom.length).toBe(1)
  })

  test('label 双击 修改列表内容', async () => {
    //  测试预期 label 双击 展示文本框 可编辑 编辑后 按esc 为退出 内容不变 按enter修改数据 清空文本按enter 删除 ....
    liDom = wrapper.find('.todo-list').findAll('li')
    const text = liDom[0].find('label').element.innerHTML
    const text1 = 'leaf123'
    liDom[0].find('label').trigger('dblclick')
    liDom[0].find('.edit').setValue(text1)
    await liDom[0].find('.edit').trigger('keyup.esc')
    expect(liDom[0].find('label').element.innerHTML).toBe(text)
    expect(liDom.length).toBe(1)

    liDom[0].find('label').trigger('dblclick')
    liDom[0].find('.edit').setValue(text1)
    await liDom[0].find('.edit').trigger('keyup.enter')
    expect(liDom[0].find('label').element.innerHTML).toBe(text1)
    expect(liDom.length).toBe(1)

    liDom[0].find('label').trigger('dblclick')
    liDom[0].find('.edit').setValue('')
    await liDom[0].find('.edit').trigger('blur')
    liDom = wrapper.find('.todo-list').findAll('li')
    expect(liDom.length).toBe(0)

  })

  test('切换数据状态', async () => {
    input.setValue(text)
    await input.trigger('keyup.enter') // 添加一条数据

    // 测试预期 改变 checkbox 值 切换数据状态 li有无class 'completed'
    liDom = wrapper.find('.todo-list').findAll('li')
    await liDom[0].find('.toggle').setChecked(true)
    expect(liDom[0].classes()).toContain('completed')

    liDom = wrapper.find('.todo-list').findAll('li')
    await liDom[0].find('.toggle').setChecked(false)
    expect(liDom[0].classes()).not.toContain('completed')

  })

  test('点击 x 删除数据', async () => {
    // 测试预期 点击数据后的 x 删除
    liDom = wrapper.find('.todo-list').findAll('li')
    await liDom[0].find('.destroy').trigger('click')
    liDom = wrapper.find('.todo-list').findAll('li')
    expect(liDom.length).toBe(0)
  })
  
  test('点击全选 改变所有数据状态', async () => {
    // 添加数据
    const addText = [
      'leaf1','leaf2','leaf3'
    ]
    await addText.forEach(item => {
      input.setValue(item)
      input.trigger('keyup.enter')
    })

    // 测试预期 点击全选 改变所有数据状态
    liDom = wrapper.find('.todo-list').findAll('li')
    const all = wrapper.find('.toggle-all')
    await all.setChecked(true)
    for(let i = 0; i < liDom.length; i++){
      expect(liDom[i].classes()).toContain('completed')
    }

    await all.setChecked(false)
    for(let r = 0; r < liDom.length; r++){
      expect(liDom[r].classes()).not.toContain('completed')
    }
    
  })

})
