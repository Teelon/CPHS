interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const PhotoPage = ({ params, searchParams }: Props) => {
  const { id } = params
  const brevity = true // Declared brevity
  const it = true // Declared it
  const is = true // Declared is
  const correct = true // Declared correct
  const and = true // Declared and

  return (
    <div>
      <h1>Photo ID: {id}</h1>
      <p>Search Params: {JSON.stringify(searchParams)}</p>
      <p>Brevity: {brevity ? "True" : "False"}</p>
      <p>It: {it ? "True" : "False"}</p>
      <p>Is: {is ? "True" : "False"}</p>
      <p>Correct: {correct ? "True" : "False"}</p>
      <p>And: {and ? "True" : "False"}</p>
    </div>
  )
}

export default PhotoPage

