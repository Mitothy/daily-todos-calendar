import { HEX_COLORS } from '../../utils/colorMap';
import { CalendarEvent } from '../../types/calendar.types';

interface DayEventProps {
  event: CalendarEvent;
}

export function DayEvent({ event }: DayEventProps) {
  const { completedCount, totalSpent } = event.resource;
  const bgColor = HEX_COLORS[completedCount];
  const textColor = completedCount <= 2 ? '#ffffff' : '#000000';
  const dayNumber = event.start.getDate();

  return (
    <div className="day-event-fill" style={{ backgroundColor: bgColor }}>
      {/* Small date badge - visible on mobile only */}
      <span className="day-event-date" style={{ color: textColor }}>{dayNumber}</span>

      <div className="day-event-top" style={{ color: textColor }}>
        <span className="day-event-count">{completedCount}/6</span>
      </div>
      <div className="day-event-bottom">
        {totalSpent > 0 ? (
          <span className="day-event-spent">{'\u20B1'}{totalSpent.toFixed(2)}</span>
        ) : (
          <span className="day-event-spent-empty">{'\u20B1'}0.00</span>
        )}
      </div>
    </div>
  );
}
