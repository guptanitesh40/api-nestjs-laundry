export function appendBaseUrlToImagesCartItems<T>(
  items: T[],
  imageFields: (keyof T)[],
): T[] {
  const baseUrl = process.env.BASE_URL || '';
  return items.map((item) => {
    imageFields.forEach((field) => {
      if (item[field]) {
        item[field] = `${baseUrl}/${item[field]}` as unknown as T[keyof T];
      }
    });
    return item;
  });
}

export function appendBaseUrlToArrayImages<T extends { images?: string[] }>(
  items: T[],
): T[] {
  const baseUrl = process.env.BASE_URL || '';
  return items.map((item) => {
    if (item.images && item.images.length > 0) {
      item.images = item.images.map((image) => `${baseUrl}/${image}`);
    }
    return item;
  });
}

export function appendBaseUrlToImagesOrPdf<
  T extends {
    image?: string;
    id_proof?: string;
    logo?: string;
    contract_document?: string;
  },
>(items: T[]): T[] {
  const baseUrl = process.env.BASE_URL || '';
  return items.map((item) => {
    if (item.image) {
      item.image = `${baseUrl}/${item.image}`;
    }
    if (item.id_proof) {
      item.id_proof = `${baseUrl}/${item.id_proof}`;
    }
    if (item.logo) {
      item.logo = `${baseUrl}/${item.logo}`;
    }
    if (item.contract_document) {
      item.contract_document = `${baseUrl}/${item.contract_document}`;
    }
    return item;
  });
}

export function appendBaseUrlToBannerAndPdf(name: string) {
  const baseUrl = process.env.BASE_URL || '';
  return `${baseUrl}/${name}`;
}

export function appendWebIp(name: string) {
  const webIp = process.env.WEBSITE_IP || '';
  return `${webIp}${name}`;
}

export function appendBaseUrlToNestedImages(order: any): any {
  const baseUrl = process.env.BASE_URL || '';

  order.items = appendBaseUrlToImagesOrPdf(order.items);
  order.items.forEach((item: any) => {
    if (item.product) {
      item.product = appendBaseUrlToImagesOrPdf([item.product])[0];
    }
    if (item.service) {
      item.service = appendBaseUrlToImagesOrPdf([item.service])[0];
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
