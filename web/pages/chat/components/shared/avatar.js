import React from 'react'
import Image from 'next/image'
const Avatar = ({ src }) => {
  const defaultSrc =
    'https://i.picsum.photos/id/1/200/300.jpg?hmac=jH5bDkLr6Tgy3oAg5khKCHeunZMHq0ehBZr6vGifPLY'
  return (
    <Image
      width={40}
      height={40}
      src={src || defaultSrc}
      alt="tada"
      layout="fixed"
    />
  )
}

export default React.memo(Avatar)
