import { FallingLines } from "react-loader-spinner";

const Loader = ({ inline = false }: { inline?: boolean }) => {

  const spinner = (
    <FallingLines
      color={inline ? "#fffacd" : "#b81104"}
      width={inline ? "28" : "100"}
      visible={true}
      ariaLabel="falling-lines-loading"
    />
  )

  if (inline) return spinner

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary">
      {spinner}
    </div>
  )
}

export default Loader
