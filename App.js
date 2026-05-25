import React from 'react';
import TodoListComponent from './TodoComponent';

/**
 * Main App component for Lords-Dashboard.
 * This is where all major modules will be integrated.
 */
const App = () => {
    return (
        <div className="App">
            <header>
                <h1>Lords-Dashboard</h1>
                <p>The central hub for project management and monitoring.</p>
            </header>
            
            <main>
                {/* 💡 Feature Integration Point */}
                <section id="todo-module">
                    <TodoListComponent />
                </section>
                
                {/* Other modules will go here */}
                <section id="metrics-dashboard">
                    {/* Future dashboard widgets */}
                </section>
            </main>
        </div>
    );
};

export default App;