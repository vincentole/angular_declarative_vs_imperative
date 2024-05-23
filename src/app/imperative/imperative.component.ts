import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-imperative',
  template: `
    <div class="p-6 bg-gray-100 min-h-screen">
      <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 class="mb-6">Imperative</h1>
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
                'bg-blue-700': showInStock,
                'bg-blue-500': !showInStock
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
              <span class="font-bold">{{ totalItemCount }}</span>
            </div>
            <div>
              Filtered Items:
              <span class="font-bold">{{ filteredItemCount }}</span>
            </div>
            <div>
              Items In Stock:
              <span class="font-bold">{{ inStockItemCount }}</span>
            </div>
            <div class="text-blue-500">{{ latestActionText }}</div>
          </div>
        </div>

        <ul class="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
          <li
            *ngFor="let item of filteredItems"
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
  imports: [NgFor, NgClass],
  standalone: true,
})
export class ImperativeComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  filterText = '';
  sortBy = 'name';
  showInStock = false;
  currentPage = 1;
  itemsPerPage = 5;
  totalItemCount = 0;
  filteredItemCount = 0;
  inStockItemCount = 0;
  latestActionText = 'The latest action was: none';

  ngOnInit(): void {
    this.fetchItems();
  }

  private fetchItems(): void {
    this.getItemsFromApi().subscribe((items) => {
      this.items = items;
      this.totalItemCount = items.length;
      this.inStockItemCount = items.filter((item) => item.inStock).length;
      this.updateList();
    });
  }

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
    this.filterText = inputElement.value;
    this.updateList();
    this.updateLatestActionText(`filter by "${inputElement.value}"`);
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortBy = selectElement.value;
    this.updateList();
    this.updateLatestActionText(`sort by "${selectElement.value}"`);
  }

  onToggleInStock(): void {
    this.showInStock = !this.showInStock;
    this.updateList();
    this.updateLatestActionText(
      this.showInStock ? 'enable in stock' : 'disable in stock'
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateList();
  }

  private updateList(): void {
    let filtered = this.items
      .filter((item) => item.name.includes(this.filterText))
      .filter((item) => !this.showInStock || item.inStock)
      .sort((a, b) => {
        if (a[this.sortBy] < b[this.sortBy]) return -1;
        if (a[this.sortBy] > b[this.sortBy]) return 1;
        return 0;
      });

    this.filteredItemCount = filtered.length;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredItems = filtered.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  private updateLatestActionText(action: string): void {
    this.latestActionText = `Latest action: ${action}`;
  }
}
