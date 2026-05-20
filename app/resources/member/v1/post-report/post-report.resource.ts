export class PostReportResource {
  static toResource(data: any) { 
    return {
      id: data.id,
      name: data.name,
      create_uid: data.member ? { id: data.member.id, name: data.member.name } : null,
      social_post_id : data.socialPost ? { id: data.socialPost.id, caption: data.socialPost.content } : { id: null, caption: null },
      shop_post_id : data.shopPost ? { id: data.shopPost.id, caption: data.shopPost.content } : { id: null, caption: null },
      create_date : data.createdAt
    };
  }
}