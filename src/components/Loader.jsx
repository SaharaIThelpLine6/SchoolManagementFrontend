const Loader = () => {
    return (
      <div className="flex h-screen items-center justify-center flex-col bg-white">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        <p>Loading...</p>
      </div>
    );
  };
  
  export default Loader;