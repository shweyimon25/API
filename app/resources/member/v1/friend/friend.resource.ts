export class FriendResource {
  static toResource(friend: any) {
    return {
      id: friend.id,
      name: friend.name,
      email: friend.email,
      phone: friend.phone,
      code: friend.code,
      memberType: friend.memberType,
      profile: friend.profile
    };
  }
}
