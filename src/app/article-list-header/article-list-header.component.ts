import { Component, OnInit } from '@angular/core';

import { ArticleService } from '../article.service';

declare var jQuery: any;

@Component({
  selector: 'app-article-list-header',
  templateUrl: './article-list-header.component.html',
  styleUrls: ['./article-list-header.component.css']
})
export class ArticleListHeaderComponent implements OnInit {

  private currentFilter: string = 'Time';
  private sortDirection: number = 1;

  constructor(
    private articleService: ArticleService
  ) { }


  changeDirection() {
    // Update the direction

    this.sortDirection *= -1;

    this._updateSort();

  }

  changeSort(filter: string) {
    // Update the filter

    if (filter == this.currentFilter) {
      this.changeDirection();
    } else {
      this.currentFilter = filter;
      this._updateSort();
    }

  }

  _updateSort() {
    // Call sortBy on the article.service
    this.articleService.sortBy(this.currentFilter,this.sortDirection);
  }

  liveSearch(evt) {
    const val = evt.target.value;
    this.articleService.filterBy(val);
  }

  ngOnInit() {
    jQuery('.ui.dropdown').dropdown();
  }

}
