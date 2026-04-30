import type { BookBookmark, MangaBookmark } from "@common/types/db";
import { addBookmark, removeBookmark } from "@store/bookmarks";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { deleteLibraryItem } from "@store/library";
import dateUtils from "@utils/date";
import { dialogUtils } from "@utils/dialog";
import { formatUtils } from "@utils/file";
import { useAppContext } from "src/renderer/App";
import ListItem from "../../../components/ListItem";

const BookmarkHistoryListItem: React.FC<{
    focused: boolean;
    isHistory: boolean;
    isBookmark: boolean;
    link: string;
    // id from db
    id: number;
    bookmark?: MangaBookmark | BookBookmark;
}> = (props) => {
    const { openInReader, setContextMenuData } = useAppContext();
    const dispatch = useAppDispatch();
    const appSettings = useAppSelector((store) => store.appSettings);
    const libraryItem = useAppSelector((store) => store.library.items[props.link]);

    if (props.isBookmark && !props.bookmark) return <p>错误：未找到书签</p>;

    // todo: this is temp only until properly implemented
    if (!libraryItem) return <p>错误：未找到项目</p>;
    if (libraryItem.type === "manga" && !libraryItem.progress) return <p>错误：未找到项目</p>;
    const link =
        props.bookmark && "page" in props.bookmark
            ? props.bookmark.link
            : libraryItem.type === "book"
              ? libraryItem.link
              : libraryItem.progress?.chapterLink;
    if (!link) return <p>错误：未找到链接</p>;

    const title = props.isHistory
        ? libraryItem.type === "book"
            ? `标题       : ${libraryItem.title}\n` +
              `章节 : ${libraryItem.progress?.chapterName || "~"}\n` +
              `日期      : ${dateUtils.format(libraryItem.progress?.lastReadAt, {
                  format: dateUtils.presets.dateTimeFull,
              })}\n` +
              `路径      : ${libraryItem.link}`
            : `漫画   : ${libraryItem.title}\n` +
              `章节 : ${libraryItem.progress?.chapterName}\n` +
              `总页数    : ${libraryItem.progress?.totalPages}\n` +
              `页码      : ${libraryItem.progress?.currentPage}\n` +
              `日期      : ${dateUtils.format(libraryItem.progress?.lastReadAt, {
                  format: dateUtils.presets.dateTimeFull,
              })}\n` +
              `路径      : ${libraryItem.link}`
        : `标题       : ${libraryItem.title}\n` +
          `章节 : ${props.bookmark?.chapterName || "~"}\n` +
          `日期      : ${dateUtils.format(props.bookmark?.createdAt, {
              format: dateUtils.presets.dateTimeFull,
          })}\n` +
          `路径      : ${props.bookmark?.itemLink}`;

    const handleClick = () => {
        if (!window.fs.existsSync(link)) {
            dialogUtils
                .confirm({
                    type: "error",
                    message: "文件/文件夹不存在。是否从书库中移除此项目？",
                    noOption: false,
                    defaultId: 0,
                    cancelId: 1,
                })
                .then((res) => {
                    if (res.response === 0) {
                        if (props.bookmark) {
                            dispatch(
                                removeBookmark({
                                    itemLink: libraryItem.link,
                                    ids: [props.id],
                                    type: libraryItem.type,
                                }),
                            );
                        } else {
                            dispatch(
                                deleteLibraryItem({
                                    link: libraryItem.link,
                                }),
                            );
                        }
                    }
                });
            return;
        }
        let options = {};
        if (props.isHistory) {
            options =
                libraryItem.type === "book"
                    ? {
                          epubChapterId: libraryItem.progress?.chapterId,
                          epubElementQueryString: libraryItem.progress?.position,
                      }
                    : { mangaPageNumber: libraryItem.progress?.currentPage || 1 };
        } else {
            if (props.bookmark && "chapterId" in props.bookmark) {
                options = {
                    epubChapterId: props.bookmark?.chapterId,
                    epubElementQueryString: props.bookmark?.position,
                };
            } else {
                options = {
                    mangaPageNumber: props.bookmark?.page,
                };
            }
        }

        openInReader(link, options);
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const items = [
            window.contextMenu.template.open(link),
            window.contextMenu.template.openInNewWindow(link),
            window.contextMenu.template.showInExplorer(link),
            window.contextMenu.template.copyPath(link),
            {
                label: "添加书签",
                action() {
                    const type = formatUtils.book.test(link) ? "book" : "manga";
                    if (type === "book" && libraryItem.progress && "chapterId" in libraryItem.progress) {
                        dispatch(
                            addBookmark({
                                type,
                                data: {
                                    chapterId: libraryItem.progress?.chapterId,
                                    position: libraryItem.progress?.position,
                                    chapterName: libraryItem.progress?.chapterName,
                                    itemLink: libraryItem.link,
                                },
                            }),
                        );
                    }
                    if (type === "manga" && libraryItem.progress && "currentPage" in libraryItem.progress) {
                        dispatch(
                            addBookmark({
                                type,
                                data: {
                                    link: libraryItem.progress?.chapterLink,
                                    itemLink: libraryItem.link,
                                    page: libraryItem.progress?.currentPage,
                                    chapterName: libraryItem.progress?.chapterName,
                                },
                            }),
                        );
                    }
                },
            },
            window.contextMenu.template.divider(),
        ];

        if (props.isHistory) {
            items.push(window.contextMenu.template.removeHistory(props.link));
        }

        if (props.isBookmark && props.bookmark) {
            items.push(
                window.contextMenu.template.removeBookmark(
                    props.bookmark.itemLink,
                    props.bookmark.id,
                    libraryItem.type,
                ),
            );
        }
        //  else if (!props.isBookmark) {
        //     items.push(window.contextMenu.template.addToBookmark(props.link));
        // }

        setContextMenuData({
            clickX: e.clientX,
            clickY: e.clientY,
            focusBackElem: e.nativeEvent.relatedTarget,
            items,
        });
    };

    return (
        <ListItem
            focused={props.focused}
            title={appSettings.showMoreDataOnItemHover ? title : undefined}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            classNameAnchor="big"
        >
            {libraryItem.type === "book" ? (
                <span className="double">
                    <span className="text">{libraryItem.title}</span>
                    <span className="chapter">
                        <span className="text">
                            {props.bookmark?.chapterName || libraryItem.progress?.chapterName || "~"}
                        </span>
                        &nbsp;&nbsp;&nbsp;
                        <span className="page">
                            <code className="nonFolder">EPUB</code>
                        </span>
                    </span>
                </span>
            ) : (
                <span className="double">
                    <span className="text">{libraryItem.title}</span>
                    <span className="chapter">
                        <span className="text">
                            {formatUtils.files.getName(
                                props.bookmark?.chapterName || libraryItem.progress?.chapterName || "~",
                            )}
                        </span>
                        &nbsp;&nbsp;&nbsp;
                        <span className="page">
                            {formatUtils.files.test(
                                props.bookmark?.chapterName || libraryItem.progress?.chapterName || "~",
                            ) && (
                                <code className="nonFolder">
                                    {formatUtils.files.getExt(
                                        props.bookmark?.chapterName || libraryItem.progress?.chapterName || "~",
                                    )}
                                </code>
                            )}
                        </span>
                    </span>
                </span>
            )}
        </ListItem>
    );
};

export default BookmarkHistoryListItem;
