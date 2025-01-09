const DefaultGreen = (props) => {
    return (
        <div>
            <button
                        className="
                                    mega-button positive
                                    text-white 
                                    bg-gradient-to-r
                                    from-green-400
                                    via-green-500
                                    to-green-600
                                    hover:bg-gradient-to-br
                                    focus:ring-4
                                    focus:outline-none
                                    focus:ring-green-300
                                    font-medium
                                    rounded-lg
                                    text-sm
                                    px-0 py-0
                                    text-center
                                    me-2 mb-2 mt-4
                                    w-24
                                    h-8
                                "
                        type="submit">
                            Save
                        {/* {props.submitButtonGreen} */}
                    </button>
        </div>
    )
}

export default DefaultGreen;