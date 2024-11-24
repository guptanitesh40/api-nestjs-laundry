export function appendBaseUrlToImages<T extends { image?: string }>(
  items: T[],
): T[] {
  const baseUrl = process.env.BASE_URL || '';
  return items.map((item) => {
    if (item.image) {
      item.image = `${baseUrl}/${item.image}`;
    }
    return item;
  });
}

export function appendBaseUrlToLogo<T extends { logo: string }>(
  items: T[],
): T[] {
  const baseUrl = process.env.BASE_URL || '';
  return items.map((item) => {
    if (item.logo) {
      item.logo = `${baseUrl}/${item.logo}`;
    }
    return item;
  });
}

export function appendBaseUrlToNestedImages(order: any): any {
  const baseUrl = process.env.BASE_URL || '';

  order.items = appendBaseUrlToImages(order.items);
  order.items.forEach((item: any) => {
    if (item.product) {
      item.product = appendBaseUrlToImages([item.product])[0];
    }
    if (item.service) {
      item.service = appendBaseUrlToImages([item.service])[0];
    }
  });

  if (order.notes && Array.isArray(order.notes)) {
    order.notes = order.notes.map((note: any) => {
      if (note.image) {
        note.image = `${baseUrl}/${note.image}`;
      }
      return note;
    });
  }

  return order;
}
