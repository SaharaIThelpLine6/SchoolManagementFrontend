const LoadingComponent = () => {
    return (
        <div
            className="loading-container hidden_in_print"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
             
            }}
        >
            
            <div className="loading-effect hidden_in_print">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={50} height={50}>
                    <circle fill="#0B7ED3" stroke="#0B7ED3" strokeWidth={7} r={7} cx={20} cy={50}>
                        <animate
                            attributeName="opacity"
                            calcMode="spline"
                            dur="2s"
                            values="1;0;1;"
                            keySplines=".5 0 .5 1;.5 0 .5 1"
                            repeatCount="indefinite"
                            begin="-.4s"
                        />
                    </circle>
                    <circle fill="#0B7ED3" stroke="#0B7ED3" strokeWidth={7} r={7} cx={50} cy={50}>
                        <animate
                            attributeName="opacity"
                            calcMode="spline"
                            dur="2s"
                            values="1;0;1;"
                            keySplines=".5 0 .5 1;.5 0 .5 1"
                            repeatCount="indefinite"
                            begin="-.2s"
                        />
                    </circle>
                    <circle fill="#0B7ED3" stroke="#0B7ED3" strokeWidth={7} r={7} cx={80} cy={50}>
                        <animate
                            attributeName="opacity"
                            calcMode="spline"
                            dur="2s"
                            values="1;0;1;"
                            keySplines=".5 0 .5 1;.5 0 .5 1"
                            repeatCount="indefinite"
                            begin="0s"
                        />
                    </circle>
                </svg>
            </div>
        </div>
    );
};

export default LoadingComponent;
