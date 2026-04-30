import type { BookNote } from "@common/types/db";
import ListItem from "@renderer/components/ListItem";
import ListNavigator from "@renderer/components/ListNavigator";
import { removeNote, updateNote } from "@store/bookNotes";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { getReaderBook } from "@store/reader";
import InputColor from "@ui/InputColor";
import Modal from "@ui/Modal";
import { colorUtils } from "@utils/color";
import dateUtils from "@utils/date";
import { dialogUtils } from "@utils/dialog";
import { DEFAULT_HIGHLIGHT_COLORS } from "@utils/highlight";
import { createRendererLogger } from "@utils/logger";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { shallowEqual } from "react-redux";
import { useAppContext } from "src/renderer/App";

const log = createRendererLogger("epub/NotesList");

const NoteModal: React.FC<{
    noteId: number;
    clear: () => void;
}> = memo(({ noteId, clear }) => {
    const bookInReader = useAppSelector(getReaderBook);
    const dispatch = useAppDispatch();
    const note = useAppSelector((store) =>
        store.bookNotes.book[bookInReader?.link || ""]?.find((n) => n.id === noteId),
    );
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [color, setColor] = useState(colorUtils.new(DEFAULT_HIGHLIGHT_COLORS[0]));

    useEffect(() => {
        if (note) {
            try {
                note.color !== "OPEN_EDIT" && setColor(colorUtils.new(note.color));
            } catch (error) {
                log.error("invalid stored note color", error);
                setColor(colorUtils.new(DEFAULT_HIGHLIGHT_COLORS[0]));
            }
        }
    }, [note]);

    useEffect(() => {
        if (noteId) {
            inputRef.current?.select();
        }
    }, [noteId]);

    if (!bookInReader) {
        clear();
        log.error(`bookInReader missing while editing note id ${noteId}`);
        dialogUtils.customError({
            message: "未知错误",
        });
        return null;
    }

    if (!note) {
        clear();
        dialogUtils.customError({
            message: "未找到笔记",
        });
        return null;
    }

    return (
        <Modal open onClose={clear} className="note-modal">
            <h3>编辑笔记</h3>

            <p className="selected-text">{note.selectedText}</p>

            <div className="note-input">
                <h4>笔记：</h4>
                <textarea
                    ref={inputRef}
                    defaultValue={note.content || ""}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    placeholder="输入笔记"
                />
                <InputColor
                    value={color}
                    onChange={(color) => {
                        setColor(color);
                    }}
                    title="颜色"
                    showAlpha={false}
                />
                <div className="color-buttons">
                    {DEFAULT_HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setColor(colorUtils.new(color))}
                            style={{ "--highlight-color": color }}
                        ></button>
                    ))}
                </div>
            </div>

            <div className="modal-actions">
                <button onClick={clear}>取消</button>
                <button
                    onClick={() => {
                        if (!inputRef.current) return;
                        dispatch(
                            updateNote({
                                id: note.id,
                                content: inputRef.current.value,
                                color: color.hexa(),
                            }),
                        );
                        clear();
                    }}
                >
                    保存
                </button>
            </div>
        </Modal>
    );
});
NoteModal.displayName = "NoteModal";

const NotesList: React.FC<{
    openChapterById: (chapterId: string, position?: string) => void;
    addNote: (color?: string) => void;
    editNoteId: number | null;
    setEditNoteId: (noteId: number | null) => void;
}> = ({ openChapterById, addNote, editNoteId, setEditNoteId }) => {
    const { setContextMenuData } = useAppContext();
    const confirmDeleteItem = useAppSelector((store) => store.appSettings.confirmDeleteItem, shallowEqual);
    const dispatch = useAppDispatch();
    const bookInReader = useAppSelector(getReaderBook);

    const notesArray: BookNote[] = useAppSelector(
        (store) =>
            [...((bookInReader && store.bookNotes.book[bookInReader.link]) || [])].sort(
                (b, a) => a.createdAt.getTime() - b.createdAt.getTime(),
            ),
        shallowEqual,
    );

    const handleNoteClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const noteId = Number(e.currentTarget.getAttribute("data-note-id"));
                if (isNaN(noteId)) throw new Error("Invalid note id");

                const note = notesArray.find((n) => n.id === noteId);
                if (!note) throw new Error("Note not found");
                openChapterById(note.chapterId, `[data-highlight-id="${noteId}"]`);
            } catch (error) {
                log.error("navigate to note chapter failed", error);
                dialogUtils.customError({
                    message: "找不到笔记",
                });
            }
        },
        [notesArray, openChapterById],
    );

    const handleNoteContextMenu = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const noteId = Number(e.currentTarget.getAttribute("data-note-id"));
            if (isNaN(noteId)) return;

            const note = notesArray.find((n) => n.id === noteId);
            if (!note) {
                dialogUtils.customError({
                    message: "找不到笔记",
                });
                return;
            }

            const items: Menu.ListItem[] = [
                {
                    label: "编辑笔记",
                    action() {
                        if (!bookInReader) return;
                        setEditNoteId(note.id);
                    },
                },
                {
                    label: "删除笔记",
                    action() {
                        if (!bookInReader) return;
                        if (!confirmDeleteItem) {
                            dispatch(removeNote({ itemLink: bookInReader.link, ids: [note.id] }));
                        } else {
                            dialogUtils
                                .warn({
                                    title: "删除笔记",
                                    message: "只会删除此笔记。是否继续？",
                                    noOption: false,
                                    buttons: ["取消", "是"],
                                    defaultId: 0,
                                })
                                .then(({ response }) => {
                                    if (!response) return;
                                    dispatch(removeNote({ itemLink: bookInReader.link, ids: [note.id] }));
                                });
                        }
                    },
                },
            ];

            setContextMenuData({
                clickX: e.clientX,
                clickY: e.clientY,
                focusBackElem: e.nativeEvent.relatedTarget,
                items,
            });
        },
        [notesArray, setContextMenuData, bookInReader, confirmDeleteItem],
    );

    useLayoutEffect(() => {
        if (notesArray.length > 0 && notesArray[0].color === "OPEN_EDIT") {
            setEditNoteId(notesArray[0].id);
        }
    }, [notesArray, setEditNoteId]);

    const renderNoteItem = useCallback(
        (note: BookNote, _index: number, isSelected: boolean) => {
            return (
                <ListItem
                    focused={isSelected}
                    title={note.content || note.selectedText}
                    key={note.id}
                    onClick={handleNoteClick}
                    onContextMenu={handleNoteContextMenu}
                    dataAttributes={{
                        "data-note-id": note.id.toString(),
                    }}
                    classNameAnchor="note-item"
                >
                    <span className="highlight-color" style={{ backgroundColor: note.color }}></span>
                    <div>
                        <span className="text">{note.chapterName}</span>
                        {note.content && <span className="text">笔记：{note.content}</span>}
                        <span
                            className={note.content === "" ? "text" : "note-selected-text"}
                            title={note.selectedText}
                        >
                            {note.selectedText}
                        </span>
                        <span className="date" title={note.createdAt.toString()}>
                            {dateUtils.format(note.createdAt, {
                                format: dateUtils.presets.dateTime,
                            })}
                        </span>
                    </div>
                </ListItem>
            );
        },
        [handleNoteClick, handleNoteContextMenu],
    );

    return (
        <>
            <div className="actions">
                {/* <input
                    type="text"
                    placeholder="添加笔记"
                    className="add-note-input"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                /> */}
                <div className="color-buttons">
                    {DEFAULT_HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => addNote(color)}
                            style={{ "--highlight-color": color }}
                        ></button>
                    ))}
                </div>
            </div>
            <div className="location-cont">
                <ListNavigator.Provider items={notesArray} renderItem={renderNoteItem} emptyMessage="暂无笔记">
                    <ListNavigator.List />
                </ListNavigator.Provider>

                {editNoteId && <NoteModal noteId={editNoteId} clear={() => setEditNoteId(null)} />}
            </div>
        </>
    );
};

export default NotesList;
