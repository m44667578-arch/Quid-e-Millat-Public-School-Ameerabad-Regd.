import React, { useState, useMemo } from 'react';
import { SchoolEvent } from '../../types';

export const eventsData: SchoolEvent[] = [
  {
    id: 1,
    title: 'Annual Sports Day',
    date: '2024-03-15',
    description: 'A day of thrilling athletic competitions, teamwork, and sportsmanship.',
    detailedDescription: 'Join us to cheer on our young athletes in a variety of track and field events. The day will conclude with a prize distribution ceremony to honor the winners and participants. Refreshments will be available for all attendees.',
    mediaUrl: 'https://picsum.photos/800/450?image=1062',
    mediaType: 'image',
  },
  {
    id: 2,
    title: 'Science Fair Exhibition',
    date: '2024-04-22',
    description: 'Explore the innovative and creative projects from our budding scientists.',
    detailedDescription: 'Our annual Science Fair is a showcase of curiosity and discovery. Students from grades 3 to 7 will present their projects on various topics ranging from environmental science to robotics. Parents and guests are welcome to interact with the students and learn about their findings.',
    mediaUrl: 'https://picsum.photos/800/450?image=24',
    mediaType: 'image',
  },
  {
    id: 3,
    title: 'Cultural Fest 2024',
    date: '2024-05-10',
    description: 'A vibrant celebration of diversity, art, and culture with performances from students.',
    detailedDescription: 'Experience a mesmerizing evening of music, dance, and drama as our students showcase their talents. The Cultural Fest is a celebration of our diverse heritage and a testament to the creativity of our students. The event will be held in the school auditorium.',
    mediaUrl: 'https://picsum.photos/800/450?image=1043',
    mediaType: 'image',
  },
   {
    id: 4,
    title: 'Parent-Teacher Conference',
    date: '2025-06-05',
    description: 'An opportunity for parents and teachers to discuss student progress.',
    detailedDescription: 'This conference is a crucial touchpoint for parents and teachers to collaborate for the student\'s academic and personal growth. We encourage all parents to attend their scheduled slots to have a productive discussion about their child\'s performance and development.',
    mediaUrl: 'https://picsum.photos/800/450?image=1025',
    mediaType: 'image',
  },
];

const EventModal: React.FC<{ event: SchoolEvent; onClose: () => void }> = ({ event, onClose }) => {
  // Helper to create a date in local timezone from YYYY-MM-DD string
  const displayDate = new Date(event.date.replace(/-/g, '/'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {event.mediaType === 'image' && <img src={event.mediaUrl} alt={event.title} className="w-full h-64 object-cover" />}
          {event.mediaType === 'video' && <video src={event.mediaUrl} controls className="w-full h-64 bg-black" />}
          <button onClick={onClose} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          <p className="text-sm font-semibold text-school-gold">{displayDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h2 className="mt-2 text-2xl font-bold text-school-blue">{event.title}</h2>
          <p className="mt-4 text-gray-700">{event.detailedDescription}</p>
        </div>
      </div>
    </div>
  );
};


const EventCard: React.FC<{ event: SchoolEvent, onLearnMore: () => void }> = ({ event, onLearnMore }) => {
  // Helper to create a date in local timezone from YYYY-MM-DD string
  const displayDate = new Date(event.date.replace(/-/g, '/'));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
      <img src={event.mediaType === 'image' ? event.mediaUrl : 'https://picsum.photos/400/250?image=1074'} alt={event.title} className="w-full h-48 object-cover"/>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm font-semibold text-school-gold">{displayDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h3 className="mt-2 text-xl font-bold text-school-blue">{event.title}</h3>
        <p className="mt-2 text-gray-600 flex-grow">{event.description}</p>
         <button onClick={onLearnMore} className="mt-4 bg-school-blue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors self-start">
          Learn More
        </button>
      </div>
    </div>
  );
};

const Calendar: React.FC<{
  events: SchoolEvent[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}> = ({ events, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventDates = useMemo(() => new Set(events.map(e => e.date)), [events]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Avoid issues with different month lengths
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-12">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Previous month">&larr;</button>
        <h3 className="text-xl font-bold text-school-blue">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Next month">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {daysInMonth.map((day, index) => {
          if (!day) return <div key={`empty-${index}`}></div>;
          
          const dateString = day.toISOString().split('T')[0];
          const isToday = dateString === todayString;
          const hasEvent = eventDates.has(dateString);
          const isSelected = selectedDate === dateString;

          return (
            <button
              key={dateString}
              onClick={() => onDateSelect(dateString)}
              className={`relative w-full aspect-square flex items-center justify-center rounded-full text-sm transition-colors duration-200 
                ${isSelected ? 'bg-school-blue text-white' : ''}
                ${!isSelected && isToday ? 'bg-school-gold text-white' : ''}
                ${!isSelected && !isToday ? 'hover:bg-gray-200' : ''}
              `}
            >
              {day.getDate()}
              {hasEvent && <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-school-gold'}`}></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Events: React.FC<{ eventsData: SchoolEvent[] }> = ({ eventsData }) => {
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return null;
    return eventsData
      .filter(event => event.date === selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedDate, eventsData]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (selectedDate) return { upcomingEvents: [], pastEvents: [] }; // Don't compute if filtered
    
    // Use string comparison to avoid timezone issues
    const todayString = new Date().toISOString().split('T')[0];

    const upcoming = eventsData
      .filter(event => event.date >= todayString)
      .sort((a, b) => a.date.localeCompare(b.date));
    const past = eventsData
      .filter(event => event.date < todayString)
      .sort((a, b) => b.date.localeCompare(a.date));
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [eventsData, selectedDate]);
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(current => (current === date ? null : date));
  };


  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">
            School Events Calendar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Stay up-to-date with our school's activities. Click a date to see its events.
          </p>
        </div>

        <Calendar events={eventsData} selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {selectedDate && (
          <section className="mb-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
               <h3 className="text-2xl font-bold text-school-blue">
                Events for {new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="bg-school-gold text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors self-start sm:self-center">
                Show All Events
              </button>
            </div>
             {filteredEvents && filteredEvents.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} onLearnMore={() => setSelectedEvent(event)} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">No events scheduled for this day.</p>
              )}
          </section>
        )}

        {!selectedDate && (
          <div className="animate-fade-in">
            <section>
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">
                    Upcoming Events
                  </h2>
                  <p className="mt-4 text-lg text-gray-600">
                    Join our vibrant school community in these exciting upcoming events.
                  </p>
                </div>
                {upcomingEvents.length > 0 ? (
                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    {upcomingEvents.map(event => (
                        <EventCard key={event.id} event={event} onLearnMore={() => setSelectedEvent(event)} />
                    ))}
                    </div>
                ) : (
                    <p className="mt-12 text-center text-gray-500">No upcoming events scheduled at the moment. Please check back soon!</p>
                )}
            </section>

            <section className="mt-20">
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">
                    Past Events
                  </h2>
                  <p className="mt-4 text-lg text-gray-600">
                    A glimpse into our memorable past events.
                  </p>
                </div>
                {pastEvents.length > 0 ? (
                    <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    {pastEvents.map(event => (
                        <EventCard key={event.id} event={event} onLearnMore={() => setSelectedEvent(event)} />
                    ))}
                    </div>
                ) : (
                    <p className="mt-12 text-center text-gray-500">No past events to show.</p>
                )}
            </section>
          </div>
        )}
      </div>
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
       <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Events;
