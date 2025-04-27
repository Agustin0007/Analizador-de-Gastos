const LoadingState = () => {
  return (
    <div className="dashboard-loading">
      <div className="loading-container">
        <div className="loading-circle"></div>
        <div className="loading-circle"></div>
        <div className="loading-circle"></div>
        <div className="loading-text">Cargando...</div>
      </div>
      <div className="loading-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
};

export default LoadingState;