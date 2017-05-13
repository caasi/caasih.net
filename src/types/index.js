export const NOP = 'NOP'
export const Nop = () => ({ type: NOP })

export const PROFILE = 'PROFILE'
export const Profile = (profile) => ({ type: PROFILE, profile })

export const POST_INDEX = 'POST_INDEX'
export const PostIndex = (post_index) => ({ type: POST_INDEX, post_index })

export const POST = 'POST'
export const Post = (url, post) => ({ type: POST, url, post })

