import React, { useState } from 'react';
import { GalleryItem } from '../../types';

export const galleryData: GalleryItem[] = [
    { id: 1, src: 'https://picsum.photos/500/500?image=1018', caption: 'Our Main Campus Building', mediaType: 'image' },
    { id: 2, src: 'https://picsum.photos/500/500?image=1078', caption: 'Engaged students in the classroom', mediaType: 'image' },
    { id: 3, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', caption: 'A short school video', mediaType: 'video' },
    { id: 4, src: 'https://picsum.photos/500/500?image=1062', caption: 'Champions at the Annual Sports Day', mediaType: 'image' },
    { id: 5, src: 'https://picsum.photos/500/500?image=1043', caption: 'Vibrant performances at the Cultural Fest', mediaType: 'image' },
    { id: 6, src: 'https://picsum.photos/500/500?image=66', caption: 'Library: A world of knowledge', mediaType: 'image' },
    { id: 7, src: 'https://picsum.photos/500/500?image=338', caption: 'Art and creativity on display', mediaType: 'image' },
    { id: 8, src: 'https://picsum.photos/500/500?image=1074', caption: 'Celebrating our graduates', mediaType: 'image' },
];

const MediaModal: React.FC<{ item: GalleryItem; onClose: () => void }> = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white p-4 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full relative" onClick={e => e.stopPropagation()}>
            {item.mediaType === 'video' ? (
                <video src={item.src} controls autoPlay className="w-full h-full object-contain max-h-[calc(90vh-80px)] bg-black" />
            ) : (
                <img src={item.src} alt={item.caption} className="w-full h-full object-contain max-h-[calc(90vh-80px)]" />
            )}
            <p className="text-center mt-4 text-lg text-gray-800">{item.caption}</p>
            <button onClick={onClose} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-2xl leading-none">&times;</button>
        </div>
    </div>
);


const Gallery: React.FC<{ galleryItems: GalleryItem[] }> = ({ galleryItems }) => {
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-school-blue sm:text-4xl">
                        School Gallery
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        A visual journey through life at Quaid-e-Millat Public School.
                    </p>
                </div>
                {galleryItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryItems.map((item) => (
                            <div key={item.id} className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md" onClick={() => setSelectedItem(item)}>
                                {item.mediaType === 'video' ? (
                                    <video
                                        src={item.src}
                                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300 bg-black"
                                    />
                                ) : (
                                    <img
                                        src={item.src}
                                        alt={item.caption}
                                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-sm font-semibold transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">{item.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">The gallery is currently empty. Please check back later for photos of our school events and activities.</p>
                )}
            </div>
            {selectedItem && <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

export default Gallery;