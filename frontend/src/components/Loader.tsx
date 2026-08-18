import { FallingLines } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary">
      <FallingLines
        color="#4fa94d"
        width="100"
        visible={true}
        ariaLabel="falling-lines-loading"
      />
    </div>
  )
}

export default Loader