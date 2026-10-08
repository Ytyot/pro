import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { speech } from '../content';
import { Stories } from './Stories';

const story = speech.stories[0]!;

function renderStory() {
  render(
    <MemoryRouter initialEntries={[`/stories/${story.id}`]}>
      <Routes>
        <Route path="stories" element={<Stories />} />
        <Route path="stories/:storyId" element={<Stories />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Stories', () => {
  it('pages forward and back with visible progress', () => {
    renderStory();
    const n = story.frames.length;
    expect(screen.getByText(story.frames[0]!.text)).toBeTruthy();
    expect(screen.getByText(`صفحة 1 من ${n}`)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'اللي قبلها' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'وبعدين؟' }));
    expect(screen.getByText(story.frames[1]!.text)).toBeTruthy();
    expect(screen.getByText(`صفحة 2 من ${n}`)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'اللي قبلها' }));
    expect(screen.getByText(story.frames[0]!.text)).toBeTruthy();
  });

  it('shows a finished screen and can read the story again', () => {
    renderStory();
    for (let k = 0; k < story.frames.length - 1; k++) fireEvent.click(screen.getByRole('button', { name: 'وبعدين؟' }));
    fireEvent.click(screen.getByRole('button', { name: 'خلصنا' }));
    expect(screen.getByText('خلصت الحكاية!')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'حكاية تانية' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'نقراها تاني' }));
    expect(screen.getByText(story.frames[0]!.text)).toBeTruthy();
  });

  it('lists every story', () => {
    render(<MemoryRouter initialEntries={['/stories']}><Routes><Route path="stories" element={<Stories />} /></Routes></MemoryRouter>);
    expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/stories/'))).toHaveLength(speech.stories.length);
  });
});
