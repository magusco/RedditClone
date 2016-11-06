import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Article } from './article';
import { environment } from '../environments/environment';

//-------------------------------------------------------------------------------------------------

/*
 * [].sort(compare(a,b))
 * return value
 *   0 == they are equal in sort
 *  1 == a comes before b
 *  -1 == b cones before a
 */
interface ArticleSortFn {
  (a: Article, b: Article): number;
}

interface ArticleSortOrderFn {
  (direction:number):ArticleSortFn;
}

//-------------------------------------------------------------------------------------------------

const sortByTime: ArticleSortOrderFn =
(direction: number) => (a:Article, b: Article) => {
  return direction * 
    (b.publishedAt.getTime() - a.publishedAt.getTime());
};

const sortByVotes: ArticleSortOrderFn =
(direction: number) => (a:Article, b: Article) => {
  return direction * (b.votes - a.votes);
};

const sortFns = {
  'Time': sortByTime,
  'Votes': sortByVotes
}

//-------------------------------------------------------------------------------------------------

@Injectable()
export class ArticleService {

  private _articles: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);
  private _sources: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  private _refreshSubject: BehaviorSubject<string> = new BehaviorSubject<string>('reddit-r-all');

  private _sortByDirectionSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  private _sortByFilterSubject: BehaviorSubject<ArticleSortOrderFn> = new BehaviorSubject<ArticleSortOrderFn>(sortByTime);

  private _filterBySubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public sources: Observable<any> = this._sources.asObservable();
  public articles: Observable<Article[]> = this._articles.asObservable();
  public orderedArticles: Observable<Article[]>;

  //-----------------------------------------------------------------------------------------------

  constructor(private http: Http) {
    this._refreshSubject.subscribe(this.getArticles.bind(this));
    
    this.orderedArticles = Observable.combineLatest(
      this._articles,
      this._sortByFilterSubject,
      this._sortByDirectionSubject,
      this._filterBySubject
    )
    .map((
      [articles, sorter, direction, filterStr]
    ) => {
      const re = new RegExp(filterStr, 'gi');
      return articles
        .filter(a => re.exec(a.title))
        .sort(sorter(direction));
    });
  }

  //-----------------------------------------------------------------------------------------------

  public updateArticles(sourceKey) {
    console.log("[article.service:updateArticles] sourceKey " + sourceKey);

    this._refreshSubject.next(sourceKey);
  }

  //-----------------------------------------------------------------------------------------------

  public getArticles(sourceKey:string = 'reddit-r-all'): void {
      // Math the http request -> Observable
      // Convert response into article class
      // Update our subject
      this._makeHttpRequest('/v1/articles', sourceKey)
      .map(json => json.articles)
      .subscribe(articlesJSON =>  {
        const articles = articlesJSON
          .map(articlejson => Article.fromJSON(articlejson));
        this._articles.next(articles);
      });
  }

  //-----------------------------------------------------------------------------------------------

  public getSources(): void {
      this._makeHttpRequest('/v1/sources')
        .map(json => json.sources)
        .filter(list => list.length > 0)
        .subscribe(this._sources);
    }

  //-----------------------------------------------------------------------------------------------

  private _makeHttpRequest(
    path: string,
    sourceKey?: string
  ): Observable<any> {

    let params = new URLSearchParams();

    params.set('apiKey', environment.newsApiKey);

    if (sourceKey && sourceKey != '') {
      params.set('source', sourceKey);
    }

    return this.http.get(`${environment.baseUrl}${path}`, {
        search: params
      })
      .map(resp => resp.json());
  }

  //-----------------------------------------------------------------------------------------------

  public sortBy(
    filter: string,
    direction: number
  ): void {
    this._sortByDirectionSubject.next(direction);
    this._sortByFilterSubject.next(sortFns[filter]);
  }

  //-----------------------------------------------------------------------------------------------

  public filterBy(
    filter: string
  ): void {
    this._filterBySubject.next(filter);
  }

  //-----------------------------------------------------------------------------------------------

  public getArticles_v4(): Promise<Article[]> {

    let params = new URLSearchParams();

    params.set('apiKey', environment.newsApiKey);
    params.set('source', 'reddit-r-all');
  
    return this.http.get(`${environment.baseUrl}/v1/articles`, {
      search: params
    })
    .toPromise()
    .then(resp => resp.json())
    .then(json => json.articles)
    .then(articles => {
      console.log('json -> ', articles);
      const list = articles.map(article => Article.fromJSON(article));
      console.log('json -> ', list);
      return list;
    })
    .catch(err => {
      console.log('We got an error', err);
    });
  }

  //-----------------------------------------------------------------------------------------------

  public getArticles_v3(): Promise<Article[]> {
    let img: string = "https://placekitten.com/g/400/300";
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          new Article('The Angular2 screencast','The easiest way to learn Angular2 with fullstack.io',img,10),
          new Article('Fullstack React','The easiest ...',img),
          new Article('But what about elm','Everybody like Elm, right?',img)
        ]);
      }, 2000);
    });
  }

  //-----------------------------------------------------------------------------------------------

  public oldGetArticles_v2(): Promise<Article[]> {
      let img: string = "https://placekitten.com/g/400/300";
      return Promise.resolve([
          new Article('The Angular2 screencast','The easiest way to learn Angular2 with fullstack.io',img,10),
          new Article('Fullstack React','The easiest ...',img),
          new Article('But what about elm','Everybody like Elm, right?',img)
        ]);
  }

  //-----------------------------------------------------------------------------------------------

}

// newsapi.org
// plh@magusco.com
// db68a046f3204db2bef28e1aacbe326f