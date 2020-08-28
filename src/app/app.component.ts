import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Task } from './task/task';
import { MatDialog } from '@angular/material/dialog';
import {
  TaskDialogComponent,
  TaskDialogResult,
} from './task-dialog/task-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo = this.store.collection('todo').valueChanges({ idField: 'id' });
  inProgress = this.store.collection('inProgress').valueChanges({ idField: 'id' });
  done = this.store.collection('done').valueChanges({ idField: 'id' });
  tasksCollection: AngularFirestoreCollection<Task>;

  constructor(
    private dialog: MatDialog,
    private store: AngularFirestore
  ) {}

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.store.collection(event.previousContainer.id).doc(event.previousContainer.data[event.previousIndex].id).delete();
      this.store.collection(event.container.id).add(event.previousContainer.data[event.previousIndex]);
    }
  }

  addItem(task: Task): void {
    this.store.collection('todo').add(task);
  }

  editItem(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }
}
