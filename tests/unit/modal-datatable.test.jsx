import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../../src/shared/components/Modal.jsx';
import { Select } from '../../src/shared/components/Select.jsx';
import { DataTable } from '../../src/shared/components/DataTable.jsx';

describe('Modal, Select, and DataTable Unit Tests', () => {
  it('Modal should render title, content, and respond to close button', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="عنوان النافذة">
        <div>محتوى النافذة</div>
      </Modal>
    );

    expect(screen.getByText('عنوان النافذة')).toBeInTheDocument();
    expect(screen.getByText('محتوى النافذة')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /إغلاق النافذة/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('Select should render options and emit onChange event', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'opt1', label: 'الخيار الأول' },
      { value: 'opt2', label: 'الخيار الثاني' },
    ];
    render(<Select label="اختر عنصر" options={options} onChange={handleChange} />);

    expect(screen.getByText('اختر عنصر')).toBeInTheDocument();
    const selectEl = screen.getByRole('combobox');
    fireEvent.change(selectEl, { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('DataTable should render columns and data rows on desktop view', () => {
    const columns = [
      { header: 'الاسم', accessorKey: 'name' },
      { header: 'البريد', accessorKey: 'email' },
    ];
    const data = [
      { id: '1', name: 'علي', email: 'ali@test.com' },
      { id: '2', name: 'عمر', email: 'omar@test.com' },
    ];

    render(<DataTable columns={columns} data={data} />);

    expect(screen.getAllByText('علي')[0]).toBeInTheDocument();
    expect(screen.getAllByText('omar@test.com')[0]).toBeInTheDocument();
  });
});
