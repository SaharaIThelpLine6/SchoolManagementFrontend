// import Quill from 'quill';
// import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

// // Editor is an uncontrolled React component
// const Editor = forwardRef(
//   ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
//     const containerRef = useRef(null);
//     const defaultValueRef = useRef(defaultValue);
//     const onTextChangeRef = useRef(onTextChange);
//     const onSelectionChangeRef = useRef(onSelectionChange);

//     useLayoutEffect(() => {
//       onTextChangeRef.current = onTextChange;
//       onSelectionChangeRef.current = onSelectionChange;
//     });

//     useEffect(() => {
//       ref.current?.enable(!readOnly);
//     }, [ref, readOnly]);

//     useEffect(() => {
//       const container = containerRef.current;
//       const editorContainer = container.appendChild(
//         container.ownerDocument.createElement('div'),
//       );
//       const quill = new Quill(editorContainer, {
//         theme: 'snow',
//       });

//       ref.current = quill;

//       if (defaultValueRef.current) {
//         quill.setContents(defaultValueRef.current);
//       }

//       quill.on(Quill.events.TEXT_CHANGE, (...args) => {
//         onTextChangeRef.current?.(...args);
//       });

//       quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
//         onSelectionChangeRef.current?.(...args);
//       });

//       return () => {
//         ref.current = null;
//         container.innerHTML = '';
//       };
//     }, [ref]);

//     return <div ref={containerRef}></div>;
//   },
// );

// Editor.displayName = 'Editor';

// export default Editor;


import Quill from 'quill';
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

const Parchment = Quill.import('parchment');

// const FontSizeStyle = new Parchment.Attributor.Style('font-size', 'font-size', {
//   scope: Parchment.Scope.INLINE,
// });
// const MarginLeftStyle = new Parchment.Attributor.Style('margin-left', 'margin-left', {
//   scope: Parchment.Scope.INLINE,
// });

// Quill.register(FontSizeStyle, true);
// Quill.register(MarginLeftStyle, true);

/*const Editor = forwardRef(
  ({ readOnly, defaultValue, htmlDefaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const htmlDefaultValueRef = useRef(htmlDefaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      );

      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],   // ← color fix
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['clean'],
          ],
        },
      });


      ref.current = quill;

      // Delta default value
      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      // HTML default value — normalize <br> and paste
      if (htmlDefaultValueRef.current) {
        const cleanedHTML = htmlDefaultValueRef.current
          .replace(/<br\s*\/?>/gi, '<br/>');
        quill.clipboard.dangerouslyPasteHTML(cleanedHTML);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;*/


const Editor = forwardRef(
  ({ readOnly, defaultValue, htmlDefaultValue, onTextChange, onSelectionChange, onHTMLChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const htmlDefaultValueRef = useRef(htmlDefaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const onHTMLChangeRef = useRef(onHTMLChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
      onHTMLChangeRef.current = onHTMLChange;
    });

    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      );

      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],  // ← color fix
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['clean'],
          ],
        },
      });

      ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      if (htmlDefaultValueRef.current) {
        const cleanedHTML = htmlDefaultValueRef.current
          .replace(/<br\s*\/?>/gi, '<br/>');
        quill.clipboard.dangerouslyPasteHTML(cleanedHTML);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);

        // Fire processed HTML on every change
        const rawHTML = quill.root.innerHTML;
        const processedHTML = rawHTML.replace(/ /g, '&nbsp;');
        onHTMLChangeRef.current?.(processedHTML);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;