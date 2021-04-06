<template>
  <section id="app" class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo inputs"
        placeholder="What needs to be done?"
        autocomplete="off"
        autofocus
        v-model="input"
        @keyup.enter="addTodo"
        >
    </header>
    <!-- <p class="inputs">{{ input }}</p> -->
    <section class="main" v-show="count" >
      <input id="toggle-all" class="toggle-all" v-model="allDown" type="checkbox">
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in filteredTodos" :key="todo"
          :class="{ editing: todo === editingTodo, completed: todo.completed }"
        >

          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" >
            <label @dblclick="editTodo(todo)">{{ todo.text }}</label>
            <button class="destroy" @click="remove(todo)"></button>
          </div>
          <input
            class="edit"
            type="text"
            v-editing-focus="todo === editingTodo"
            v-model="todo.text"
            @keyup.enter="doneEdit(todo)"
            @blur="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
            >
        </li>
      </ul>
    </section>
    
    <footer class="footer" v-show="count">
      <span class="todo-count">
        <strong>{{ remainingCount }}</strong> {{ remainingCount > 1 ? 'items' : 'item' }} left
      </span>
      <ul class="filters">
        <li><a href="#/all">All</a></li>
        <li><a href="#/active">Active</a></li>
        <li><a href="#/completed">Completed</a></li>
      </ul>
      <button class="clear-completed"  v-show="count > remainingCount" @click="removeCompleted">
        Clear completed
      </button>
    </footer>

  </section>
 
</template>

<script>
import './assets/index.css'
import useLocalStorage from './utils/useLocalStorage'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
const storage = useLocalStorage()

// add
const useAdd = todos => {
  const input = ref('')
  const addTodo = () => {
    const text = input.value && input.value.trim()
    if(text.length === 0) return
    todos.value.unshift({
      text,
      completed: false
    })
    input.value = ''
  }
  return { input, addTodo }
}

// remove
const useRemove = todos => {
  const remove = todo => {
    const inx = todos.value.indexOf(todo)
    todos.value.splice(inx, 1)
  }
  const removeCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  return { remove, removeCompleted }
}

// edit
const useEdit = remove => {
  let beforeEditingText = ''
  const editingTodo = ref(null)
  const editTodo = todo => {
    beforeEditingText = todo.text
    editingTodo.value = todo
  }
  const doneEdit = todo => {
    if(!editingTodo.value) return 
    todo.text = todo.text.trim()
    todo.text || remove(todo)
    editingTodo.value = null
  }
  const cancelEdit = todo => {
    editingTodo.value = null
    todo.text = beforeEditingText
  }
  return {
    editingTodo,
    editTodo,
    doneEdit,
    cancelEdit
  }
}

// swith
const useFilter = todos => {
  const allDown = computed({
    get(){
      return !todos.value.filter(todo => !todo.completed).length
    },
    set(value){
      todos.value.forEach(todo => {
        todo.completed = value
      })
    }
  })

  const filter = {
    all: list => list,
    active: list => list.filter(todo => !todo.completed),
    completed: list => list.filter(todo => todo.completed)
  }

  const type = ref('all')
  const filteredTodos = computed(() => filter[type.value](todos.value))
  const remainingCount = computed(() => filter.active(todos.value).length)
  const count = computed(() => todos.value.length)

  const onHashChange = () => {
    const hash = window.location.hash.replace('#/', '')
    if(filter[hash]) {
      type.value = hash
    }else{
      type.value = 'all'
      window.location.hash = ''
    }
  }

  onMounted(() => {
    window.addEventListener('hashchange',onHashChange)
    onHashChange()
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange',onHashChange)
  })

  return { allDown, filteredTodos, remainingCount, count }
}

// storage
const useStorage = () => {
  const KEY = 'TODOKEYS'
  const todos = ref(storage.getItem(KEY) || [])
  watchEffect(() => {
    storage.setItem(KEY, todos.value)
  })
  return todos
}


export default {
  name: 'App',
  setup(){
    const todos = useStorage()
    const { remove, removeCompleted } = useRemove(todos)
    return{
      todos,
      remove,
      removeCompleted,
      ...useAdd(todos),
      ...useEdit(remove),
      ...useFilter(todos)
    }
  },
  directives: {
    editingFocus: (el, binding) => {
      binding.value && el.focus()
    }
  } 
}
</script>

<style>
</style>
