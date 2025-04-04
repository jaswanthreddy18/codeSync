import EditorPage from '../components/EditorPage'
import Home from '../components/Home'
import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom' 
import { Toaster, toast } from "sonner";

const appRouter = createBrowserRouter([
  {
    path:'/',
    element: <Home />
  },
  {
    path:'/editor/:id',
    element: <EditorPage />
  },
])
function App() {
  return (
    <>
      <Toaster position='top-right'/>
      <RouterProvider router = {appRouter} />
    </>
  )
}

export default App
