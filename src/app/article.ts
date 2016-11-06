interface ArticleJSON {
   title: string;
   url: string;
   urlToImage: string;
   votes: number;
   publishedAt: string;
   description: string;
   author: string;
}

export class Article {

  public publishedAt: Date;

  static fromJSON(json: ArticleJSON): Article {
    let article = Object.create(Article.prototype);
    return Object.assign(article, json, {
      votes: json.votes ? json.votes : 0,
      imageUrl: json.urlToImage,
      publishedAt: json.publishedAt ? new Date(json.publishedAt) : new Date()
    });
  }

  constructor (
    public title: string,
    public description: string,
    public imageUrl: string,
    public votes?: number
  ) {
    this.votes = votes || 0;
    this.publishedAt = new Date();
  }

  public upvote(): void {
    this.votes += 1;
    console.log("[Article] upvote");
  }

  public downvote(): void {
    this.votes -= 1;
    console.log("[Article] downvote");
  }
  
}
