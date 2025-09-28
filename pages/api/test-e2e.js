// pages/api/test-e2e.js
import { createClient } from '@supabase/supabase-js'
import { withCors } from '../../lib/corsHandler'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing end-to-end flow');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Create a test user
    const testEmail = `e2e-test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      console.error('Sign up error:', signUpError)
      return res.status(500).json({ error: 'Sign up failed', details: signUpError.message })
    }

    console.log('User created:', user?.id)

    // Sign in to get token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      return res.status(500).json({ error: 'Sign in failed', details: signInError.message })
    }

    const token = signInData.session?.access_token
    if (!token) {
      return res.status(500).json({ error: 'No token received' })
    }

    // Create a client with the user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    console.log('User authenticated, starting end-to-end test')

    // Step 1: Add rooms
    console.log('Step 1: Adding rooms')
    const { data: roomData, error: roomError } = await userClient
      .from('rooms')
      .insert([{
        name: 'Room 101',
        type: 'private',
        max_capacity: 2,
        owner_id: user.id
      }, {
        name: 'Dorm A',
        type: 'dorm',
        max_capacity: 8,
        owner_id: user.id
      }])
      .select()

    if (roomError) {
      console.error('Room creation error:', roomError)
      return res.status(500).json({ error: 'Room creation failed', details: roomError.message })
    }

    console.log(`Created ${roomData?.length} rooms`)

    // Step 2: Add beds (for dorm rooms)
    console.log('Step 2: Adding beds')
    const { data: bedData, error: bedError } = await userClient
      .from('beds')
      .insert([
        { room_id: roomData[1]?.id, name: 'Bed 1', owner_id: user.id },
        { room_id: roomData[1]?.id, name: 'Bed 2', owner_id: user.id }
      ])
      .select()

    if (bedError) {
      console.error('Bed creation error:', bedError)
      return res.status(500).json({ error: 'Bed creation failed', details: bedError.message })
    }

    console.log(`Created ${bedData?.length} beds`)

    // Step 3: Add guests
    console.log('Step 3: Adding guests')
    const { data: guestData, error: guestError } = await userClient
      .from('guests')
      .insert([{
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        owner_id: user.id
      }, {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        owner_id: user.id
      }])
      .select()

    if (guestError) {
      console.error('Guest creation error:', guestError)
      return res.status(500).json({ error: 'Guest creation failed', details: guestError.message })
    }

    console.log(`Created ${guestData?.length} guests`)

    // Step 4: Make a booking
    console.log('Step 4: Making a booking')
    // Using tomorrow's date for check-in and check-out
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkIn = tomorrow.toISOString().split('T')[0]
    
    const nextDay = new Date(tomorrow)
    nextDay.setDate(nextDay.getDate() + 1)
    const checkOut = nextDay.toISOString().split('T')[0]
    
    const { data: bookingData, error: bookingError } = await userClient
      .from('bookings')
      .insert([{
        guest_id: guestData[0]?.id,
        room_id: roomData[0]?.id, // Private room
        check_in: `${checkIn}T14:00:00`,
        check_out: `${checkOut}T10:00:00`,
        status: 'confirmed',
        owner_id: user.id
      }])
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return res.status(500).json({ error: 'Booking creation failed', details: bookingError.message })
    }

    console.log('Created booking:', bookingData?.id)

    // Step 5: Add a payment for the booking
    console.log('Step 5: Adding payment')
    const { data: paymentData, error: paymentError } = await userClient
      .from('payments')
      .insert([{
        booking_id: bookingData?.id,
        amount: 100.00,
        currency: 'USD',
        method: 'credit_card',
        status: 'completed',
        owner_id: user.id
      }])
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return res.status(500).json({ error: 'Payment creation failed', details: paymentError.message })
    }

    console.log('Created payment:', paymentData?.id)

    // Step 6: Create a housekeeping task
    console.log('Step 6: Creating housekeeping task')
    const { data: taskData, error: taskError } = await userClient
      .from('housekeeping_tasks')
      .insert([{
        room_id: roomData[0]?.id,
        task_type: 'checkout_cleaning',
        assigned_date: checkOut,
        assigned_to: null, // assigned_to is a UUID field (user ID), not a name
        notes: 'Clean after checkout',
        owner_id: user.id
      }])
      .select()
      .single()

    if (taskError) {
      console.error('Housekeeping task creation error:', taskError)
      return res.status(500).json({ error: 'Housekeeping task creation failed', details: taskError.message })
    }

    console.log('Created housekeeping task:', taskData?.id)

    // Step 7: Create a notification
    console.log('Step 7: Creating notification')
    const { data: notificationData, error: notificationError } = await userClient
      .from('notifications')
      .insert([{
        user_id: user.id,
        title: 'Booking Confirmation',
        message: 'Your booking has been confirmed',
        type: 'success',
        booking_id: bookingData?.id,
        guest_id: guestData[0]?.id,
        owner_id: user.id  // Make sure to set owner_id for RLS policy
      }])
      .select()
      .single()

    if (notificationError) {
      console.error('Notification creation error:', notificationError)
      return res.status(500).json({ error: 'Notification creation failed', details: notificationError.message })
    }

    console.log('Created notification:', notificationData?.id)

    // Step 8: Verify all data created correctly
    console.log('Step 8: Verifying data')
    
    // Fetch all rooms for the user
    const { data: allRooms, error: roomsFetchError } = await userClient
      .from('rooms')
      .select('*')
    
    if (roomsFetchError) {
      console.error('Rooms fetch error:', roomsFetchError)
      return res.status(500).json({ error: 'Rooms fetch failed', details: roomsFetchError.message })
    }

    // Fetch all guests for the user
    const { data: allGuests, error: guestsFetchError } = await userClient
      .from('guests')
      .select('*')
    
    if (guestsFetchError) {
      console.error('Guests fetch error:', guestsFetchError)
      return res.status(500).json({ error: 'Guests fetch failed', details: guestsFetchError.message })
    }

    // Fetch all bookings for the user
    const { data: allBookings, error: bookingsFetchError } = await userClient
      .from('bookings')
      .select('*, guests(name), rooms(name)')
    
    if (bookingsFetchError) {
      console.error('Bookings fetch error:', bookingsFetchError)
      return res.status(500).json({ error: 'Bookings fetch failed', details: bookingsFetchError.message })
    }

    // Fetch all payments for the user
    const { data: allPayments, error: paymentsFetchError } = await userClient
      .from('payments')
      .select('*')
    
    if (paymentsFetchError) {
      console.error('Payments fetch error:', paymentsFetchError)
      return res.status(500).json({ error: 'Payments fetch failed', details: paymentsFetchError.message })
    }

    // Fetch all housekeeping tasks for the user
    const { data: allTasks, error: tasksFetchError } = await userClient
      .from('housekeeping_tasks')
      .select('*')
    
    if (tasksFetchError) {
      console.error('Tasks fetch error:', tasksFetchError)
      return res.status(500).json({ error: 'Tasks fetch failed', details: tasksFetchError.message })
    }

    // Fetch all notifications for the user
    const { data: allNotifications, error: notificationsFetchError } = await userClient
      .from('notifications')
      .select('*')
    
    if (notificationsFetchError) {
      console.error('Notifications fetch error:', notificationsFetchError)
      return res.status(500).json({ error: 'Notifications fetch failed', details: notificationsFetchError.message })
    }

    const e2eTestResults = {
      user: { id: user.id, email: testEmail },
      rooms: { count: allRooms?.length, expected: 2 },
      guests: { count: allGuests?.length, expected: 2 },
      bookings: { count: allBookings?.length, expected: 1 },
      payments: { count: allPayments?.length, expected: 1 },
      housekeepingTasks: { count: allTasks?.length, expected: 1 },
      notifications: { count: allNotifications?.length, expected: 1 },
      bookingDetails: allBookings[0],
      success: allRooms?.length === 2 &&
                allGuests?.length === 2 &&
                allBookings?.length === 1 &&
                allPayments?.length === 1 &&
                allTasks?.length === 1 &&
                allNotifications?.length === 1
    }

    console.log('End-to-end test completed successfully', e2eTestResults)

    res.status(200).json(e2eTestResults)
  } catch (error) {
    console.error('End-to-end test error:', error)
    res.status(500).json({ error: 'End-to-end test failed', details: error.message })
  }
})