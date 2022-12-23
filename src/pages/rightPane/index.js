import React, { useEffect, useCallback, useMemo } from "react"
import TabBar from "../../components/TabBar"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from "prop-types"
import fsHelper from "../../utils/fileHelper";
import * as marked from 'marked'
import message from "../../utils/message";
import { store } from "../../layout";


const RightPane = ({ fileList, currentOpen, unsaveFiles, handleFileChange, handleReadFile, setUnSaveFiles, openFileTab }) => {
    const currentFile = fileList.find(item => item.id === currentOpen)
    const content = currentFile.content;
    const files = store.get('files');
    useEffect(() => {
        if (currentFile && !currentFile.isRead) {
            fsHelper.readFile(currentFile.path).then(content => {
                handleReadFile(currentOpen, content)
            }).catch(err => {
                if (err) {
                    message('文件不存在', 'error');
                    delete files[currentFile.id];
                    store.set('files', files)
                }
            })
        }
    }, [currentOpen])


    useEffect(() => {
        document.addEventListener('keydown', function(e){
            if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                // e.preventDefault();
                alert('saved');
            }
        });
    }, [])

    const handleSave = () => {
        fsHelper.writeFile(currentFile.path, currentFile.content).then(res => {
            setUnSaveFiles(unsaveFiles.filter(id => id !== currentOpen))
        });
    }
    
    const handleContentChange = useCallback((val) => {
        if (val !== content) {
            handleFileChange(val, currentOpen);
        }
    }, [currentOpen])
    console.log(unsaveFiles)

    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
          autofocus: true,
          spellChecker: false,
          minHeight: '550px',
          maxHeight: '580px',
          previewRender:(plainText, preview) => { // Async method
                return preview.innerHTML = marked.parse(plainText) ? marked.parse(plainText) : 'loading...';
            }
        }
      }, []);

    return <div>
        <TabBar tabBarList={openFileTab} currentOpen={currentOpen} unsaveFiles={unsaveFiles} />
        <SimpleMDE
            options={autofocusNoSpellcheckerOptions}
            onChange={val => handleContentChange(val)}
            value={content ? content : '请输入内容'}
        />
        <div onClick={handleSave} className="text-center d-block btn btn-primary">
            保存
        </div>
    </div>
}

RightPane.propTypes = {
    fileList: PropTypes.array,
    currentOpen: PropTypes.string,
    unsaveFiles: PropTypes.array,
    handleFileChange: PropTypes.func,
    handleReadFile: PropTypes.func,
    openFileTab: PropTypes.array
}

RightPane.defaultProps = {
    fileList: [],
    openFileTab: []
}

export default RightPane