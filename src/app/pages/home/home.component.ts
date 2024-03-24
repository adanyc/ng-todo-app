import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  tasks = signal<Task[]>([]);
  filter = signal<'all' | 'pending' | 'completed'>('all');
  taskByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'pending') {
      return tasks.filter(task => !task.completed);
    }
    if (filter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return tasks;
  });
  taskStatus: 'completed' | 'editing' = 'completed';
  newTaskControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
    ],
  });
  inject = inject(Injector);

  ngOnInit(): void {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks();
  }

  trackTasks() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, { injector: this.inject });
  }

  changeHandler(): void {
    if (this.newTaskControl.valid) {
      const value = this.newTaskControl.value;
      if (value !== '') {
        this.addTask(value);
        this.newTaskControl.setValue('');
      }
    }
  };

  addTask(title: string): void {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  deleteTask(index: number): void {
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  }

  updateTask(index: number): void {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            completed: !task.completed,
          }
        }
        return task;
      })
    });
  }

  updateTaskEditingMode(index: number): void {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            editing: true,
          }
        }
        return {
          ...task,
          editing: false,
        };
      })
    });
  }

  updateTaskText(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            title: inputElement.value,
            editing: false,
          }
        }
        return task;
      })
    });
  }

  changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter);
  }
}
