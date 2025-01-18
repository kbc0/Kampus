import React, { useState } from 'react';
import { Plus, Grip, X } from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { CustomSection } from '../../../types/profile';
import { v4 as uuidv4 } from 'uuid';

interface CustomSectionsEditorProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

export const CustomSectionsEditor: React.FC<CustomSectionsEditorProps> = ({
  sections,
  onChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addSection = () => {
    const newSection: CustomSection = {
      id: uuidv4(),
      title: '',
      content: '',
      order: sections.length
    };
    onChange([...sections, newSection]);
    setEditingId(newSection.id);
  };

  const updateSection = (id: string, updates: Partial<CustomSection>) => {
    onChange(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter(section => section.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update order
    newSections.forEach((section, i) => {
      section.order = i;
    });

    onChange(newSections);
  };

  return (
    <Card
      title="Custom Sections"
      description="Add your own sections to your profile"
    >
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="bg-gray-700/30 rounded-lg border border-gray-700 p-4 
              hover:border-violet-500/30 transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Grip className="h-5 w-5 text-gray-400 cursor-move" />
                {editingId === section.id ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 
                      text-white focus:outline-none focus:border-violet-500"
                    placeholder="Section Title"
                  />
                ) : (
                  <h3 className="text-lg font-medium text-white">
                    {section.title || 'Untitled Section'}
                  </h3>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors"
                >
                  ↓
                </button>
                <button
                  onClick={() => editingId === section.id 
                    ? setEditingId(null) 
                    : setEditingId(section.id)
                  }
                  className="p-1 text-gray-400 hover:text-violet-400 transition-colors"
                >
                  {editingId === section.id ? 'Save' : 'Edit'}
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {editingId === section.id ? (
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                  text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                placeholder="Section content..."
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                {section.content}
              </div>
            )}
          </div>
        ))}

        <Button onClick={addSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
    </Card>
  );
};