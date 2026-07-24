import Modal, { ModalBody } from '../ui/Modal'
import Button from '../ui/Button'
import './CampaignCard.css'

const PROPOSALS = [
  {
    name: 'Sarah Mitchell',
    niche: 'Fashion & Lifestyle • 125K followers',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rate: '$2,200',
    time: '1-2 weeks',
    text: "I'm excited about your sustainable fashion campaign! I've been an advocate for eco-friendly fashion for 3 years and have strong engagement with exactly your target audience...",
  },
  {
    name: 'Emma Rodriguez',
    niche: 'Fashion Blogger • 89K followers',
    avatar: 'https://i.pravatar.cc/150?img=45',
    rate: '$1,800',
    time: '4-7 days',
    text: 'Your summer collection aligns perfectly with my content style. I can create 3 Instagram posts and 5 stories highlighting the sustainable aspects...',
  },
]

export default function ProposalsModal({ onClose, onAccept, onDecline }) {
  return (
    <Modal title="Campaign Proposals" onClose={onClose}>
      <ModalBody>
        <div className="proposals-list">
          {PROPOSALS.map((p, i) => (
            <div key={i} className="proposal-item">
              <div className="proposal-header">
                <div className="influencer-info">
                  <img src={p.avatar} alt={p.name} className="proposal-avatar" />
                  <div className="influencer-details">
                    <h4>{p.name}</h4>
                    <p>{p.niche}</p>
                  </div>
                </div>
                <div className="proposal-rate">
                  <span className="rate-label">Proposed Rate:</span>
                  <span className="rate-amount">{p.rate}</span>
                </div>
              </div>
              <div className="proposal-body">
                <p>
                  <strong>Delivery Time:</strong> {p.time}
                </p>
                <p className="proposal-text">{p.text}</p>
              </div>
              <div className="proposal-footer">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onDecline()
                    onClose()
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onAccept()
                    onClose()
                  }}
                >
                  Accept & Hire
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  )
}
