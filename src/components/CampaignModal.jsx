import { useState } from 'react'
import Modal, { ModalBody } from './ui/Modal'
import Button from './ui/Button'
import { FormGroup, InputWithIcon } from './ui/FormGroup'

export default function CampaignModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    budget: '',
    description: '',
    requirements: '',
    location: '',
    minFollowers: '',
    status: 'live',
  })

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title || !form.category || !form.budget || !form.description) return
    onSubmit(form)
  }

  return (
    <Modal title="Create New Campaign" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup label="Campaign Title" required>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="e.g. Summer Fashion Launch"
              required
            />
          </FormGroup>
          <FormGroup label="Category" required>
            <select name="category" value={form.category} onChange={handle} required>
              <option value="">Select a category</option>
              <option value="fashion">Fashion</option>
              <option value="tech">Technology</option>
              <option value="food">Food & Beverage</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="health">Health & Wellness</option>
              <option value="travel">Travel</option>
            </select>
          </FormGroup>
          <FormGroup label="Budget" required>
            <InputWithIcon icon="$">
              <input
                name="budget"
                value={form.budget}
                onChange={handle}
                placeholder="e.g. 5000"
                required
              />
            </InputWithIcon>
          </FormGroup>
          <FormGroup label="Description" required>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="Describe your campaign goals and deliverables..."
              rows={4}
              required
            />
          </FormGroup>
          <FormGroup label="Requirements">
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handle}
              placeholder="Specific requirements for influencers..."
              rows={3}
            />
          </FormGroup>
          <div className="form-row">
            <FormGroup label="Location">
              <input
                name="location"
                value={form.location}
                onChange={handle}
                placeholder="e.g. United States"
              />
            </FormGroup>
            <FormGroup label="Min. Followers">
              <input
                name="minFollowers"
                value={form.minFollowers}
                onChange={handle}
                placeholder="e.g. 10000"
              />
            </FormGroup>
          </div>
          <FormGroup label="Campaign Status">
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                ['live', '🌐 Live'],
                ['private', '🔒 Private'],
                ['draft', '📝 Draft'],
              ].map(([val, label]) => (
                <label
                  key={val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: form.status === val ? 700 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={val}
                    checked={form.status === val}
                    onChange={handle}
                  />
                  {label}
                </label>
              ))}
            </div>
          </FormGroup>
        </ModalBody>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Campaign
          </Button>
        </div>
      </form>
    </Modal>
  )
}
