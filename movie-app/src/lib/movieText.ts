export function getMovieDescription(content?: string) {
  const description = content
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

  return description || 'Nội dung phim đang được cập nhật.'
}
