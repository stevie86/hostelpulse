import { isToday, format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from 'components/Button'
import Container from 'components/Container'
import SectionTitle from 'components/SectionTitle'

type Guest = { id: string; name: string; email: string }
type Room = { id: string; name: string; type: string }
type Booking = {
  id: string
  check_in: string
  check_out: string
  status: string
  guests: Guest
  rooms?: { name: string }
  beds?: { name: string }
}
type HousekeepingTask = {
  id: string
  room_id: string
  room_name: string
  assigned_to?: string
  assigned_date: string
  completed: boolean
  completed_by?: string
  completed_at?: string
  notes?: string
  task_type: 'checkout_cleaning' | 'maintenance' | 'inspection' | 'deep_clean'
}

export default function HousekeepingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  useEffect(() => { 
    load() 
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [bookingsRes, tasksRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/housekeeping-tasks')
      ])
      
      // If housekeeping tasks API doesn't exist yet, use mock data
      let tasksData: HousekeepingTask[] = []
      let bookingsData: Booking[] = []
      
      if (tasksRes.ok) {
        const [bookingsJson, tasksJson] = await Promise.all([
          bookingsRes.json(),
          tasksRes.json()
        ])
        bookingsData = bookingsJson
        tasksData = tasksJson
      } else {
        // Generate mock tasks from bookings data
        bookingsData = await bookingsRes.json()
        const todaysDepartures = bookingsData.filter(b => isToday(new Date(b.check_out)) && b.status === 'confirmed')
        
        tasksData = todaysDepartures.map((b, index) => ({
          id: `task-${b.id}`,
          room_id: b.rooms?.name ? `room-${index}` : b.beds?.name ? `bed-${index}` : 'unknown',
          room_name: b.beds ? `Bed: ${b.beds.name}` : b.rooms ? `Room: ${b.rooms.name}` : 'Unassigned',
          assigned_date: new Date().toISOString(),
          completed: false,
          task_type: 'checkout_cleaning',
          notes: 'Clean room after guest checkout'
        }))
      }
      
      setHousekeepingTasks(tasksData)
      setBookings(bookingsData)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const pendingTasks = housekeepingTasks.filter(task => !task.completed)
  const completedTasks = housekeepingTasks.filter(task => task.completed)

  const markTaskCompleted = async (taskId: string) => {
    try {
      // In a real app, this would call the API
      setHousekeepingTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true, completed_by: 'Current User', completed_at: new Date().toISOString() } 
          : task
      ))
    } catch (e) {
      setError('Failed to update task')
    }
  }

  return (
    <Container>
      <Wrapper>
        <Header>
          <SectionTitle>Housekeeping</SectionTitle>
          <Tabs>
            <Tab 
              active={activeTab === 'pending'} 
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingTasks.length})
            </Tab>
            <Tab 
              active={activeTab === 'completed'} 
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedTasks.length})
            </Tab>
          </Tabs>
        </Header>
        
        {error && <ErrorText>{error}</ErrorText>}
        
        {loading ? (
          <Small>Loading tasks…</Small>
        ) : activeTab === 'pending' ? (
          pendingTasks.length === 0 ? (
            <EmptyState>No pending tasks right now.</EmptyState>
          ) : (
            <TaskList>
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} completed={task.completed}>
                  <TaskHeader>
                    <TaskRoom>{task.room_name}</TaskRoom>
                    <TaskBadge type={task.task_type}>{task.task_type.replace('_', ' ')}</TaskBadge>
                  </TaskHeader>
                  <TaskDetails>
                    <TaskNote>{task.notes || 'No special notes'}</TaskNote>
                    <TaskDate>Assigned: {format(new Date(task.assigned_date), 'MMM d, h:mm a')}</TaskDate>
                  </TaskDetails>
                  <TaskActions>
                    <Button 
                      onClick={() => markTaskCompleted(task.id)}
                    >
                      Mark Complete
                    </Button>
                  </TaskActions>
                </TaskItem>
              ))}
            </TaskList>
          )
        ) : (
          completedTasks.length === 0 ? (
            <EmptyState>No completed tasks yet.</EmptyState>
          ) : (
            <TaskList>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} completed={task.completed}>
                  <TaskHeader>
                    <TaskRoom>{task.room_name}</TaskRoom>
                    <TaskBadge type={task.task_type} completed={task.completed}>
                      {task.task_type.replace('_', ' ')}
                    </TaskBadge>
                  </TaskHeader>
                  <TaskDetails>
                    <TaskNote>{task.notes || 'No special notes'}</TaskNote>
                    <TaskDate>Completed: {task.completed_at ? format(new Date(task.completed_at), 'MMM d, h:mm a') : 'Unknown'}</TaskDate>
                  </TaskDetails>
                  {task.completed_by && (
                    <TaskCompletedBy>Completed by: {task.completed_by}</TaskCompletedBy>
                  )}
                </TaskItem>
              ))}
            </TaskList>
          )
        )}
      </Wrapper>
    </Container>
  )
}

const Wrapper = styled.div` padding: 2rem 0; `

const Header = styled.div`
  margin-bottom: 1.5rem;
`

const Tabs = styled.div`
  display: flex;
  margin-top: 1rem;
  border-bottom: 1px solid rgb(var(--border));
`

const Tab = styled.div<{ active: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? 'rgb(var(--primary))' : 'transparent'};
  color: ${props => props.active ? 'rgb(var(--primary))' : 'inherit'};
  
  &:hover {
    opacity: 0.8;
  }
`

const ErrorText = styled.div` 
  color: #b91c1c; 
  margin-bottom: 1rem;
`

const Small = styled.p` 
  opacity: 0.8; 
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
`

const TaskList = styled.div` 
  display: grid; 
  gap: 1rem; 
`

const TaskItem = styled.div<{ completed: boolean }>`
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem; 
  padding: 1rem;
  background: ${props => props.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgb(var(--cardBackground))'};
  opacity: ${props => props.completed ? 0.8 : 1};
`

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const TaskRoom = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
`

const TaskBadge = styled.div<{ type: string; completed?: boolean }>`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 1rem;
  text-transform: capitalize;
  
  ${props => {
    switch(props.type) {
      case 'checkout_cleaning':
        return props.completed 
          ? 'background: rgba(16, 185, 129, 0.2); color: #047857;' 
          : 'background: rgba(251, 191, 36, 0.2); color: #92400e;';
      case 'maintenance':
        return props.completed 
          ? 'background: rgba(16, 185, 129, 0.2); color: #047857;' 
          : 'background: rgba(251, 146, 60, 0.2); color: #c2410c;';
      case 'inspection':
        return props.completed 
          ? 'background: rgba(16, 185, 129, 0.2); color: #047857;' 
          : 'background: rgba(139, 92, 246, 0.2); color: #6d28d9;';
      case 'deep_clean':
        return props.completed 
          ? 'background: rgba(16, 185, 129, 0.2); color: #047857;' 
          : 'background: rgba(16, 185, 129, 0.2); color: #047857;';
      default:
        return 'background: rgba(156, 163, 175, 0.2); color: #374151;';
    }
  }}
`

const TaskDetails = styled.div`
  margin: 0.8rem 0;
`

const TaskNote = styled.div`
  font-size: 1.3rem;
  margin-bottom: 0.3rem;
`

const TaskDate = styled.div`
  font-size: 1.1rem;
  opacity: 0.7;
`

const TaskCompletedBy = styled.div`
  font-size: 1.1rem;
  opacity: 0.7;
  margin-top: 0.5rem;
  font-style: italic;
`

const TaskActions = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
`
