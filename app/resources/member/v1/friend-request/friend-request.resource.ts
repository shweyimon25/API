function toMember(m: any) {
  if (!m) return null;
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    code: m.code,
    profile: m.profile ?? null,
  };
}

export class FriendRequestResource {
  static toResource(request: any) {
    return {
      id: request.id,
      senderId: request.senderId,
      receiverId: request.receiverId,
      status: request.status,
      sender: toMember(request.sender),
      receiver: toMember(request.receiver),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
