export class MonacoBinding {
    /**
     * @param {Y.Text} ytext
     * @param {monaco.editor.ITextModel} monacoModel
     * @param {Set<monaco.editor.IStandaloneCodeEditor>} [editors]
     * @param {Awareness?} [awareness]
     */
    constructor(ytext: Y.Text, monacoModel: monaco.editor.ITextModel, editors?: Set<monaco.editor.IStandaloneCodeEditor> | undefined, awareness?: Awareness | null | undefined);
    doc: Y.Doc;
    ytext: Y.Text;
    monacoModel: monaco.editor.ITextModel;
    editors: Set<monaco.editor.IStandaloneCodeEditor>;
    mux: import("lib0/mutex").mutex;
    /**
     * @type {Map<monaco.editor.IStandaloneCodeEditor, RelativeSelection>}
     */
    _savedSelections: Map<monaco.editor.IStandaloneCodeEditor, RelativeSelection>;
    _beforeTransaction: () => void;
    _decorations: Map<any, any>;
    _rerenderDecorations: () => void;
    /**
     * @param {Y.YTextEvent} event
     */
    _ytextObserver: (event: Y.YTextEvent) => void;
    _monacoChangeHandler: monaco.IDisposable;
    _monacoDisposeHandler: monaco.IDisposable;
    awareness: Awareness | undefined;
    destroy(): void;
}
import * as Y from "yjs";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
declare class RelativeSelection {
    /**
     * @param {Y.RelativePosition} start
     * @param {Y.RelativePosition} end
     * @param {monaco.SelectionDirection} direction
     */
    constructor(start: Y.RelativePosition, end: Y.RelativePosition, direction: monaco.SelectionDirection);
    start: Y.RelativePosition;
    end: Y.RelativePosition;
    direction: monaco.SelectionDirection;
}
import { Awareness } from "y-protocols/awareness";
export {};
