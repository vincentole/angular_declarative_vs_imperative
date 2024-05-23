import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { AsyncPipe, NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-declarative',
  imports: [AsyncPipe, NgFor, NgClass],
  standalone: true,
  template: `
    <div class="p-6 bg-gray-100 min-h-screen">
      <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 class="mb-6">Declarative</h1>
        <div class="mb-6">
          <input
            type="text"
            (input)="onFilterChange($event)"
            placeholder="Filter items"
            class="w-full py-1 px-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div class="flex space-x-4 mb-4">
            <select
              (change)="onSortChange($event)"
              class="w-full py-1 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              (click)="onToggleInStock()"
              [ngClass]="{
                'bg-blue-700': inStockSubject.value,
                'bg-blue-500': !inStockSubject.value
              }"
              class="py-1 px-4 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Toggle In Stock
            </button>
          </div>
        </div>

        <div class="mb-6">
          <div class="mb-2 text-lg font-semibold">Summary</div>
          <div class="flex flex-col space-y-2">
            <div>
              Total Items:
              <span class="font-bold">{{ totalItemCount$ | async }}</span>
            </div>
            <div>
              Filtered Items:
              <span class="font-bold">{{ filteredItemCount$ | async }}</span>
            </div>
            <div>
              Items In Stock:
              <span class="font-bold">{{ inStockItemCount$ | async }}</span>
            </div>
            <div class="text-blue-500">{{ latestActionText$ | async }}</div>
          </div>
        </div>

        <ul class="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
          <li
            *ngFor="let item of filteredItems$ | async"
            class="p-2 border-b border-gray-200 last:border-0"
          >
            {{ item.name }} ({{ item.category }}) -
            <span
              class="font-semibold"
              [ngClass]="{
                'text-green-500': item.inStock,
                'text-red-500': !item.inStock
              }"
            >
              {{ item.inStock ? 'In Stock' : 'Out of Stock' }}
            </span>
          </li>
        </ul>

        <div class="flex justify-center space-x-2">
          <button
            (click)="onPageChange(1)"
            class="py-1 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Page 1
          </button>
          <button
            (click)="onPageChange(2)"
            class="py-1 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Page 2
          </button>
          <button
            (click)="onPageChange(3)"
            class="py-1 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Page 3
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DeclarativeComponent implements OnInit {
  inStockSubject = new BehaviorSubject<boolean>(false);
  private filterSubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<string>('name');
  private pageSubject = new BehaviorSubject<number>(1);
  private itemsPerPage = 5;

  items$: Observable<any[]> = this.getItemsFromApi();

  filteredItems$ = combineLatest([
    this.items$,
    this.filterSubject,
    this.sortSubject,
    this.inStockSubject,
    this.pageSubject,
  ]).pipe(
    map(([items, filterText, sortBy, showInStock, currentPage]) => {
      const filtered = items
        .filter((item) => item.name.includes(filterText))
        .filter((item) => !showInStock || item.inStock)
        .sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1;
          if (a[sortBy] > b[sortBy]) return 1;
          return 0;
        });

      const startIndex = (currentPage - 1) * this.itemsPerPage;
      return filtered.slice(startIndex, startIndex + this.itemsPerPage);
    })
  );

  totalItemCount$ = this.items$.pipe(map((items) => items.length));

  filteredItemCount$ = this.filteredItems$.pipe(
    map((filteredItems) => filteredItems.length)
  );

  inStockItemCount$ = this.items$.pipe(
    map((filteredItems) => {
      return filteredItems.filter((item) => item.inStock).length;
    })
  );

  latestActionText$ = merge(
    this.filterSubject.pipe(
      map((filterText) => `Latest action: filter by "${filterText}"`)
    ),
    this.sortSubject.pipe(
      map((sortBy) => `Latest action: sort by "${sortBy}"`)
    ),
    this.inStockSubject.pipe(
      map((showInStock) =>
        showInStock
          ? 'Latest action: show in stock items only'
          : 'Latest action: show all items'
      )
    )
  );

  ngOnInit(): void {}

  private getItemsFromApi(): Observable<any[]> {
    const mockItems = [
      { name: 'Item 1', category: 'A', inStock: true },
      { name: 'Item 2', category: 'B', inStock: false },
      { name: 'Item 3', category: 'A', inStock: true },
      { name: 'Item 4', category: 'B', inStock: true },
      { name: 'Item 5', category: 'A', inStock: true },
      { name: 'Item 6', category: 'B', inStock: false },
      { name: 'Item 7', category: 'A', inStock: true },
      { name: 'Item 8', category: 'B', inStock: false },
      { name: 'Item 9', category: 'A', inStock: true },
      { name: 'Item 10', category: 'B', inStock: true },
    ];
    return of(mockItems).pipe(delay(1000));
  }

  onFilterChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filterSubject.next(inputElement.value);
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortSubject.next(selectElement.value);
  }

  onToggleInStock(): void {
    this.inStockSubject.next(!this.inStockSubject.value);
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
  }
}
