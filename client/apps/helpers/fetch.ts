import { SITE_API_URL } from "@/config/setting";
import { parseContentToHTML } from "@/helpers/function";

export async function fetchLogin(data: any, slug: string) {
  const response = await fetch(SITE_API_URL + slug, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
}

export async function fetchLinkData(slug: string, token: string | null) {
  const response = await fetch(SITE_API_URL + slug, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  return result;
}

export async function fetchLinkCreate(
  data: any,
  slug: string,
  token: string | null,
) {
  const formData = {
    destination: data.destination,
  };

  if (data?.alias) {
    Object.assign(formData, { alias: data.alias });
  }

  const response = await fetch(SITE_API_URL + slug, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  return result;
}

export async function fetchLinkUpdate(
  data: any,
  slug: string,
  token: string | null,
) {
  const formData = {
    destination: data.destination,
  };

  const isAliasChanges = data?.alias === data?.originalAlias;

  if (!isAliasChanges) {
    Object.assign(formData, { alias: data.alias });
  }

  const response = await fetch(SITE_API_URL + slug, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  return result;
}

export async function fetchLinkDelete(slug: string, token: string | null) {
  const response = await fetch(SITE_API_URL + slug, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  return result;
}

export async function fetchPostData(slug: string, token: string | null) {
  const response = await fetch(SITE_API_URL + slug, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  return result;
}

export async function fetchPostCreate(
  data: any,
  slug: string,
  token: string | null,
) {
  delete data.hash_id;
  data.content = parseContentToHTML(data.content);

  const response = await fetch(SITE_API_URL + slug, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
}

export async function fetchPostUpdate(
  data: any,
  slug: string,
  token: string | null,
) {
  delete data.hash_id;
  data.content = parseContentToHTML(data.content);

  const response = await fetch(SITE_API_URL + slug, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
}

export async function fetchPostDelete(slug: string, token: string | null) {
  const response = await fetch(SITE_API_URL + slug, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  return result;
}
