// Mengubah _id -> id dan membuang field internal, supaya UI tetap memakai `item.id`.
export function baseTransform(_doc, ret) {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
  return ret;
}
