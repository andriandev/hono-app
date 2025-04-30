import Hashids from 'hashids';

export const hashId = new Hashids('node_shortlink', 4);
export const hashIdApp = new Hashids('hono_hashids_app', 4);
