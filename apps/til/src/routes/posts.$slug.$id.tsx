import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$slug/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/posts/$slug/$id"!</div>
}
