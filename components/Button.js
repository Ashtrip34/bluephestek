export default function Button({ children, className = '', onClick, type = 'button' }){
  return (
    <button type={type} className={"btn btn-primary " + className} onClick={onClick}>{children}</button>
  )
}
