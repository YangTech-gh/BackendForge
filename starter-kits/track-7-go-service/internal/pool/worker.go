package pool

import (
	"context"
	"sync"
)

type Job func(ctx context.Context) error

type WorkerPool struct {
	jobs    chan Job
	results chan error
	wg      sync.WaitGroup
}

func NewWorkerPool(workerCount, jobBufferSize int) *WorkerPool {
	return &WorkerPool{
		jobs:    make(chan Job, jobBufferSize),
		results: make(chan error, jobBufferSize),
	}
}

func (p *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < cap(p.jobs); i++ {
		p.wg.Add(1)
		go p.worker(ctx)
	}
}

func (p *WorkerPool) worker(ctx context.Context) {
	defer p.wg.Done()
	for {
		select {
		case <-ctx.Done():
			return
		case job, ok := <-p.jobs:
			if !ok {
				return
			}
			p.results <- job(ctx)
		}
	}
}

func (p *WorkerPool) Submit(job Job) {
	p.jobs <- job
}

func (p *WorkerPool) Stop() {
	close(p.jobs)
	p.wg.Wait()
	close(p.results)
}

func (p *WorkerPool) Results() <-chan error {
	return p.results
}
