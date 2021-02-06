import React, { useEffect, useState } from 'react'
import { Form, Button } from 'semantic-ui-react'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import { useParams } from 'react-router'
import { useAuth0 } from '@auth0/auth0-react'

interface RouteParams {
  todoId: string
}

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoState {
  file: File | null
  uploadState: UploadState
}

const initalState: EditTodoState = {
  file: null,
  uploadState: UploadState.NoUpload
}

export const EditTodo = () => {
  const [token, setToken] = useState<string>('')
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const { todoId } = useParams<RouteParams>()

  const [state, set] = useState<EditTodoState>(initalState)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    set((s) => ({
      ...s,
      file: files[0]
    }))
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!state.file) {
        alert('File should be selected')
        return
      }

      setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(token, todoId)

      setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      setUploadState(UploadState.NoUpload)
    }
  }

  function setUploadState(uploadState: UploadState) {
    set((s) => ({
      ...s,
      uploadState
    }))
  }

  useEffect(() => {
    isAuthenticated && getAccessTokenSilently()
      .then(t => setToken(t))
  }, [isAuthenticated])

  return (
    <div>
      <h1>Upload new image</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>File</label>
          <input
            type="file"
            accept="image/*"
            placeholder="Image to upload"
            onChange={handleFileChange}
          />
        </Form.Field>

        {renderButton()}
      </Form>
    </div>
  )

  function renderButton() {
    return (
      <div>
        {state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
