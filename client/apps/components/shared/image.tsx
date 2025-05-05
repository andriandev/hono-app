'use client';

import NextImage, { ImageProps } from 'next/image';
import { SITE_IMG_LOADER } from '@/config/setting';

type Props = ImageProps & {
  optimize?: Boolean;
};

export default function Image({ optimize = true, ...props }: Props) {
  const loaderImage: string = SITE_IMG_LOADER;

  if (!optimize) {
    const { src, alt, width, height, ...rest } = props;
    return (
      <img
        src={src as string}
        alt={alt ?? ''}
        width={width}
        height={height}
        {...rest}
      />
    );
  }

  const placeHolder =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAYGBgYGBgYHBwYJCgkKCQ0MCwsMDRQODw4PDhQfExYTExYTHxshGxkbIRsxJiIiJjE4Ly0vOEQ9PURWUVZwcJYBBgYGBgYGBgcHBgkKCQoJDQwLCwwNFA4PDg8OFB8TFhMTFhMfGyEbGRshGzEmIiImMTgvLS84RD09RFZRVnBwlv/CABEIAAcACgMBEQACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAADB//aAAgBAQAAAACtL//EABUBAQEAAAAAAAAAAAAAAAAAAAIE/9oACAECEAAAAJX/AP/EABUBAQEAAAAAAAAAAAAAAAAAAAME/9oACAEDEAAAALD/AP/EAB0QAAICAQUAAAAAAAAAAAAAAAECAAMRBAUGQVH/2gAIAQEAAT8AXWU7MGdqBYre9GDlpwMJP//EABgRAAIDAAAAAAAAAAAAAAAAAAABEhNB/9oACAECAQE/ALnqJI//xAAZEQEAAgMAAAAAAAAAAAAAAAABAAIDEUH/2gAIAQMBAT8AMBxjS25//9k=';

  if (loaderImage === 'imagekit.io') {
    const imageKitLoader = ({
      src,
      width,
      quality,
    }: {
      src: string;
      width: number;
      quality?: number;
    }) => {
      return `${src}?tr=w-${width},q-${quality || 75}`;
    };

    return (
      <NextImage loader={imageKitLoader} placeholder={placeHolder} {...props} />
    );
  }

  return <NextImage placeholder={placeHolder} {...props} />;
}
